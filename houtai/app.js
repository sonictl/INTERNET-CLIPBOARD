const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { log } = require('console');

const app = express();
const port = 3002;

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // other CORS headers...
  next();
});

// Create and connect to SQLite database
const db = new sqlite3.Database('./clipboard.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS clipboard (
    id TEXT PRIMARY KEY,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP DEFAULT NULL,
    expire_days INTEGER DEFAULT 1,
    burn_after_read BOOLEAN DEFAULT 0
  )
`);

// Function to create a clipboard
function createClipboard(id, res, expireDays = 1, burnAfterRead = 0) {
  const sql = `INSERT INTO clipboard (id, expire_days, burn_after_read) VALUES (?, ?, ?)`;
  db.run(sql, [id, expireDays, burnAfterRead], function (err) {
    if (err) {
      console.log('创建失败' + err);
      res.json({
        status: 500,
        message: "创建失败"
      });
      return false;
    }
    return true;
  });
}

// Create clipboard endpoint
app.post('/createClipboard', (req, res) => {
  const { id, expireDays, burnAfterRead } = req.body;
  console.log('创建一个剪贴板中索引是' + id);
  createClipboard(id, res, expireDays || 1, burnAfterRead || 0);
  res.json({
    status: 200,
    message: "剪贴板创建成功"
  });
});

// Insert content endpoint
app.post('/insertContent', (req, res) => {
  const { id, content, expireDays, burnAfterRead } = req.body;
  console.log('正在插入上下文');
  const insertSql = `UPDATE clipboard SET content = ?, last_viewed_at = CURRENT_TIMESTAMP, expire_days = COALESCE(?, expire_days), burn_after_read = COALESCE(?, burn_after_read) WHERE id = ?`;
  db.run(insertSql, [content, expireDays, burnAfterRead, id], function (err) {
    if (err) {
      console.log('查询上下文出错' + err);
      res.json({
        status: 500,
        message: '查询上下文出错'
      });
      return;
    }
    if (this.changes === 0) {
      console.log('没有找到匹配的记录');
      res.json({
        status: 404,
        message: '未找到指定ID的剪贴板'
      });
      return;
    }
    console.log('ok!插入数据成功');
    res.json({
      status: 200,
      message: '文本保存成功',
      data: { id, content }
    });
  });
});

// Get clipboard data endpoint
app.post('/getClipboard', (req, res) => {
  const { id } = req.body;
  console.log('请求剪贴板' + id);
  const checkExistenceQuery = `SELECT * FROM clipboard WHERE id = ?`;


  db.get(checkExistenceQuery, [id], (error, row) => {
    if (error) {
      console.log('数据库查询错误', error);
      res.json({
        status: 500,
        message: '数据库查询错误'
      });
      return;
    }

    if (!row) {
      console.log('没有这个索引正在创建');
      createClipboard(id, res);
    } else {
      // 检查是否过期
      const now = new Date();
      const lastViewed = row.last_viewed_at ? new Date(row.last_viewed_at) : new Date(row.created_at);
      const expireDays = row.expire_days || 1;
      const expirationDate = new Date(lastViewed);
      expirationDate.setDate(expirationDate.getDate() + expireDays);
      
      if (now > expirationDate) {
        // 剪贴板已过期，删除它
        db.run(`DELETE FROM clipboard WHERE id = ?`, [id], function(err) {
          if (err) {
            console.log('删除过期剪贴板失败', err);
          }
          res.json({
            status: 404,
            message: '剪贴板已过期'
          });
        });
        return;
      }
      
      // 检查是否为阅后即焚
      if (row.burn_after_read === 1 && row.count > 0) {
        // 阅后即焚且已被查看过，标记为已读但不立即删除
        // 返回数据并添加标记，前端会显示警告
        row.is_burn_after_read_viewed = true;
      }

      // 更新数据库剪贴板的查看次数
      const updateSql = `UPDATE clipboard SET count = count + 1, last_viewed_at = CURRENT_TIMESTAMP WHERE id = ?`;
      db.run(updateSql, [id], function (err) {
        if (err) {
          console.log('添加查看次数错误', err);
          res.json({
            status: 500,
            message: '查看次数添加失败'
          });
          return;
        }

        res.json({
          status: 200,
          message: '成功获取到剪贴板数据',
          data: row
        });
      });
    }
  });
});

// 定期清理过期的剪贴板
function cleanupExpiredClipboards() {
  const now = new Date().toISOString();
  const sql = `
    DELETE FROM clipboard 
    WHERE (julianday(?) - julianday(last_viewed_at)) > expire_days
  `;
  
  db.run(sql, [now], function(err) {
    if (err) {
      console.error('清理过期剪贴板失败:', err);
    } else {
      console.log(`已清理 ${this.changes} 个过期剪贴板`);
    }
  });
}

// 每小时运行一次清理
setInterval(cleanupExpiredClipboards, 60 * 60 * 1000);
// 启动时也运行一次清理
cleanupExpiredClipboards();

// 删除剪贴板端点
app.post('/deleteClipboard', (req, res) => {
  const { id } = req.body;
  console.log('正在删除剪贴板，索引是：' + id);
  
  const deleteSql = `DELETE FROM clipboard WHERE id = ?`;
  db.run(deleteSql, [id], function(err) {
    if (err) {
      console.log('删除剪贴板失败', err);
      res.json({
        status: 500,
        message: '删除剪贴板失败'
      });
      return;
    }
    
    if (this.changes === 0) {
      console.log('没有找到要删除的剪贴板');
      res.json({
        status: 404,
        message: '未找到指定ID的剪贴板'
      });
      return;
    }
    
    console.log('剪贴板删除成功');
    res.json({
      status: 200,
      message: '剪贴板删除成功'
    });
  });
});

app.listen(port, () => {
  console.log(`运行成功正在监听端口 ${port}`);
});
