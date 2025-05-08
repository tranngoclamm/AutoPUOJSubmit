const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const runSubmissionScript = require('./submit_bulk');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

app.get('/ketqua.csv', (req, res) => {
    res.sendFile(path.join(__dirname, 'ketqua.csv'));
  });

  
app.post('/upload', upload.array('codeFiles'), async (req, res) => {
  // Di chuyển file vào thư mục cố định (./codes)
  const destDir = './codes';
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of req.files) {
    const destPath = path.join(destDir, file.originalname);
    fs.renameSync(file.path, destPath);
  }

  res.json({ success: true, files: req.files.map(f => f.originalname) });
});

app.post('/run', async (req, res) => {
  const result = await runSubmissionScript(); 
  res.json({ success: true, results: result });
});

app.listen(3000, () => console.log('🌐 Giao diện chạy tại http://localhost:3000'));
