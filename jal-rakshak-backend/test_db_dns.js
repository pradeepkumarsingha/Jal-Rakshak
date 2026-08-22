const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mrpradeepkumarsingha_db_user:mx4Shdi01FhIU4Bk@cluster0.cjmcggz.mongodb.net/jalrakshak?retryWrites=true&w=majority';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Let's retrieve the latest 5 citizen reports
    const CitizenReport = mongoose.model('CitizenReport', new mongoose.Schema({}, { strict: false }));
    const reports = await CitizenReport.find({}).sort({ createdAt: -1 }).limit(5);

    console.log('--- LATEST 5 REPORTS ---');
    reports.forEach((r, idx) => {
      console.log(`\nReport #${idx + 1}:`);
      console.log(`ID: ${r._id}`);
      console.log(`ReportCode: ${r.reportId}`);
      console.log(`VerificationStatus: ${r.verificationStatus}`);
      console.log(`WaterLevel: ${r.waterLevel}`);
      console.log(`Image:`, JSON.stringify(r.image, null, 2));
      console.log(`AI Analysis:`, JSON.stringify(r.aiAnalysis, null, 2));
      console.log(`CreatedAt: ${r.createdAt}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

run();
