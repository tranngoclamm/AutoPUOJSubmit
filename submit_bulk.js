const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const USERNAME = '21010291';
const PASSWORD = '@@a';
const BASE_URL = 'https://puoj.phenikaa-uni.edu.vn';
const SOURCE_DIR = './codes'; 

const problemMap = {
  'bai1_d1': 'beginner_045',
  'bai1_d2': 'beginner_043',
  'bai1_d3': 'beginner_043',
  'bai1_d4': 'beginner_043',
  'bai2_d1': 'beginner_047',
  'bai2_d2': 'beginner_048',
  'bai2_d3': 'beginner_048',
  'bai2_d4': 'beginner_048',
  'bai3_d1': 'beginner_049',
  'bai3_d2': 'beginner_050',
  'bai3_d3': 'beginner_050',
  'bai3_d4': 'beginner_050',
};
async function runSubmissionScript() {
  console.log('🚀 Bắt đầu khởi chạy trình duyệt...');
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  console.log('🌐 Truy cập trang đăng nhập...');
  await page.goto(`${BASE_URL}/accounts/login/`);

  console.log('🔑 Nhập thông tin đăng nhập...');
  await page.type('input[name=username]', USERNAME);
  await page.type('input[name=password]', PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForSelector('span.rating.rate-none.user a[href^="/user/"]', { timeout: 5000 });
  console.log('✅ Đăng nhập thành công.');

  console.log('📂 Đọc danh sách file trong thư mục...');
  const files = fs.readdirSync(SOURCE_DIR).filter(f => fs.statSync(path.join(SOURCE_DIR, f)).isFile());
  console.log(`📄 Tìm thấy ${files.length} file .cpp`);

  const results = [];

  for (const file of files) {
    console.log(`\n➡️ Xử lý file: ${file}`);
    const match = file.match(/(\d+)_bai(\d+)_d(\d+)/);
    if (!match) {
      console.log(`⚠️  Bỏ qua file vì không đúng định dạng tên: ${file}`);
      continue;
    }

    const [_, msv, bai, d] = match;
    const key = `bai${bai}_d${d}`;
    const problemCode = problemMap[key];

    if (!problemCode) {
      console.log(`❌ Không tìm thấy mapping cho: ${key}`);
      continue;
    }

    const submitUrl = `${BASE_URL}/problem/${problemCode}/submit`;
    console.log(`🌐 Truy cập trang submit: ${submitUrl}`);
    await page.goto(submitUrl);

    const filePath = path.resolve(SOURCE_DIR, file);
    console.log(`📤 Upload file: ${filePath}`);
    const inputFile = await page.$('input[type=file]');
    await inputFile.uploadFile(filePath);

    console.log('📨 Bấm nút Submit...');
    await page.click('input[type=submit]');
    await page.waitForSelector('#test-cases', { timeout: 5000 });

    const submissionUrl = page.url();
    const subIdMatch = submissionUrl.match(/submission\/(\d+)/);
    const subId = subIdMatch ? subIdMatch[1] : 'unknown';
    console.log(`🔁 Chuyển hướng đến: ${submissionUrl} | ID: ${subId}`);

    try {
      console.log('⏳ Chờ kết quả chấm...');
      await page.waitForFunction(() => {
        const el = document.querySelector('#test-cases');
        return el && el.innerHTML.includes('Final score:');
      }, { timeout: 10000 });
      const scoreText = await page.$eval('#test-cases', el => el.innerText);
      const finalScoreMatch = scoreText.match(/Final score:\s*(\d+\/\d+)/);
     
      let score = 'unknown';
      if (finalScoreMatch) {
        score = finalScoreMatch[1]; 
      }
    
      results.push({ msv, file, subId, score });
      fs.unlinkSync(filePath);
      console.log(`✅ Kết quả: ${score}`);
    } catch (err) {
      results.push({ msv, file, subId, score: 'timeout or error' });
      fs.unlinkSync(filePath);
      console.log(`❌ Lỗi khi chờ kết quả: ${err.message}`);
    }
  }

  console.log('\n📥 Đóng trình duyệt...');
  await browser.close();

  console.log('💾 Ghi file ketqua.csv...');
  const csv = results.map(r => `${r.msv},${r.subId},${r.score},${r.file}`).join('\n');
  fs.appendFileSync('ketqua.csv', csv + '\n');

  console.log('✅ Hoàn tất ghi file. Tổng cộng:', results.length, 'bài.');
  return results;
}

module.exports = runSubmissionScript;