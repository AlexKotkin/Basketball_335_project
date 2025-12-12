const express = require("express");
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const mongoose = require("mongoose");
const { name } = require("ejs");

const app = express();
const port = process.argv[2];

app.set("views", __dirname);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
      dbName: "CMSC335DB",
    });
    console.log("Connected to MongoDB via Mongoose");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

}


const rosterSchema = new mongoose.Schema({
  email:{type:String, required:true},
  lineupName:{type:String, required: true},
  players: [{
    name: String,
    status: String,
    jersey: Number
  }],    
  createdAt:{
    type:Date,
    default:Date.now
  }
})

const Roster = mongoose.model("Roster", rosterSchema)

// function makeTable(contents) {
//   let html = `
//     <table border="1">
//       <tr>
//         <th>Name</th>
//         <th>Result</th>
//       </tr>
//   `;

//   contents.forEach(p => {
//     html += `
//       <tr>
//         <td>${p.name}</td>
//         <td>
//           ${p.status === "found"
//             ? `Jersey #${p.jersey}`
//             : `<span style="color:red">${p.message}</span>`
//           }
//         </td>
//       </tr>
//     `;
//   });

//   html += `</table>`;
//   return html;
// }



app.get("/", (req, res) => {
  res.render("index");
});

app.get("/playerForm", (req,res) => {
  res.render("playerForm")
})

async function getPlayerFromAPI(fullname){
  const [first , last]=fullname.trim().split(" ")


  const url = `https://v2.nba.api-sports.io/players?name=${last}`;

  try {
    const response = await fetch(url, {
        headers: {
          // In .env name api key "RAPID_API_KEY"
          // Disclaimer only 100 requests per day
          "x-apisports-key": process.env.RAPID_API_KEY
          
        }
      });

    const data = await response.json();
    const player = data.response.find(
      p => p.firstname.toLowerCase() === first.toLowerCase()
    );
    return player || null

    
  } catch (err) {
    console.error(err);
    return null
  }
  
};



app.post("/getRoster", async (req, res) => {
  const names = [
    req.body.p1,
    req.body.p2,
    req.body.p3,
    req.body.p4,
    req.body.p5
    
  ].filter(x=> x && x.trim() !== "");
  const players =[]
for (const name of names){

    const apiPlayer = await getPlayerFromAPI(name)
    if (apiPlayer) {
      players.push({
        name: `${apiPlayer.firstname} ${apiPlayer.lastname}`,
        status: "found",
        jersey: apiPlayer.leagues?.standard?.jersey ?? null
      });
    } else {
      players.push({
        name: name,
        status: "not_found",
        jersey: null,
        message: "Player does not exist"
      });
    }
}


  const roster = new Roster({
    email:req.body.email,
    lineupName:req.body.lineup,
    players

  })
  await roster.save()
  // const tableHTML = makeTable(players)

  res.render("playerResults", { players })
})


// Show page where user builds lineup
app.get("/retreiveRoster", (req, res)=>{
    res.render("getRoster");
})

app.post("/retreiveRoster", async (req, res)=>{
 
 try{
  const {email,lineup}=req.body
  const roster = await Roster.findOne({
    email:email,
    lineupName:lineup

  })
  if (!roster){
  return res.render("playerResults", {
    players:[],
    error:"No roster found for that email and lineup name"

  })
}
res.render("playerResults", {
  players:roster.players

})
 } catch (err){
  console.error(err)
  res.status(500).send("Server error retrieving roster")
 }
 



})



//Save Lineup

app.get("/apitest", async (req, res) => {
  const fullName = "LeBron James";
  const [first, last] = fullName.trim().split(" ");

  const url = `https://v2.nba.api-sports.io/players?name=${last}`;

  try {
    const response = await fetch(url, {
        headers: {
          // In .env name api key "RAPID_API_KEY"
          // Disclaimer only 100 requests per day
          "x-apisports-key": process.env.RAPID_API_KEY
          
        }
      });

    const data = await response.json();
    const player = data.response.find(
      p => p.firstname.toLowerCase() === first.toLowerCase()
    );
    console.log("TEsTT");
    res.send(player || "Player not found");
  } catch (err) {
    console.error(err);
    res.send("API test failed");
  }
});


(async()=>{
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    process.stdout.write("Stop to shutdown the server: ");
  });
})()


process.stdin.setEncoding("utf8");



process.stdin.on("readable", () => {
  let dataInput;
  while ((dataInput = process.stdin.read()) !== null) {
    const command = dataInput.trim().toLowerCase();
    if (command === "stop") {
      process.stdout.write("Shutting Down Server\n");
      process.exit(0);
    } else {
      console.log(`Invalid Command: ${command}`);
      process.stdout.write("Stop to shutdown the server: ");
    }
  }
});
