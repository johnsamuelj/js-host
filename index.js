const cron = require("node-cron");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const smtp = require('nodemailer');
let projectDataJson = {};
let mongourl = process.env.mongourl;

const mailClient = smtp.createTransport({
  service: "gmail",
  auth: {
    user: 'jjohnsamuel21@gmail.com',
    pass: 'uqppobbcpnnezzck',
  },
});

cron.schedule("36 20 * * *", async () => {
  // Your script execution logic here
  console.log("Script executed!");
  const client = await MongoClient.connect(mongourl);

  //Get projects
  const projects = await client
    .db("ktern-masterdb")
    .collection("kt_m_projects")
    .find({})
    .toArray();
  let jsonData = {};
  for (let project of projects) {
    let projectData = {};
    let dbName = project.dbName;
    let projectURL = project.dbURL;
    let projectConnect = await MongoClient.connect(projectURL);
    //get tasks
    let tasks = await projectConnect
      .db(dbName)
      .collection("kt_t_taskLists")
      .find({})
      .toArray();
    projectData["tasks"] = tasks.length;

    //get signoffs
    let signoffs = await projectConnect
      .db(dbName)
      .collection("kt_t_signoffs")
      .find({})
      .toArray();
    projectData["signoffs"] = signoffs.length;
    projectData["project"] = {
      projectID: project.projectID,
      projectName: project.projectName,
      dbName: dbName,
    };
    jsonData[dbName] = projectData;
  }

  const today = new Date();
  const dateString = today.toLocaleDateString();
  projectDataJson[dateString] = jsonData;
  // projectDataJson = JSON.stringify(projectDataJson, null, 2);
  console.log(Object.keys(projectDataJson))
  
   const result = await mailClient.sendMail({
      from: 'jjohnsamuel21@gmail.com',
      to: 'jjohnsamuel21@gmail.com',
        subject: 'Hello World',
        text: JSON.stringify(projectDataJson)
    });
  

});
