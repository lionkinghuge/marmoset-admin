  // Import discord.js and create the client
  const { clientAPI, APICall } = require("./getNFT");
  const Discord = require('discord.js')
  const client = new Discord.Client();
  const Verified = require("../models/Verified");
  // Register an event so that when the bot is ready, it will log a messsage to the terminal
  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  })

  // Register an event to handle incoming messages
  client.on('message', async msg => {
    // This block will prevent the bot from responding to itself and other bots
    if(msg.author.bot) {
      return
    }
    // Get the roles of the member who sent the message
    const roles = msg.member.roles.cache.map(role => role.name);
    // Log the roles
    console.log(`Roles of ${msg.author.tag}: ${roles.join(', ')}`);

    const isVerifiedUser = await Verified.findOne({discord:msg.author.tag});
    if(isVerifiedUser)
    {const NFTcount = await checkNFTowner(isVerifiedUser.wallet);
        let msgss = "";
        if(NFTcount===0)
        {msgss = "You no own NFT.";
             if(!roles.includes("NoNFT")){
                 
                 msg.member.roles.add("NoNFT").catch(console.error);
                 msg.reply("You get the NoNFT role.");
             }
        }
        else if(NFTcount>0&&NFTcount<100)
        {
             if(!roles.includes("NFTowner")){
              msg.member.roles.add("NFTowner").catch(console.error);
              msg.reply("You get the role of NFTowner");
             }
        }
        else if(NFTcount>=100)
        msgss = "YOu own much NFTs";
    }
    else
    msg.reply("You have to verify yourself.http://localhost:3001/verify");    
// if(!roles.includes("AAA")){
    //   let roleName = "AAA"; // replace this with the name of your role
    //   let role = msg.guild.roles.cache.find(r => r.name === roleName);
    //   if (!role) {
    //       console.log(`The role ${roleName} does not exist`);
    //       return;
    //   }
    //   // Add the role to the member who sent the message
    //   msg.member.roles.add(role).catch(console.error);
    // }
    // Check if the message starts with '!hello' and respond with 'world!' if it does.
    if(msg.content.startsWith("!hello")) {
     
    }
  })

  // client.login logs the bot in and sets it up for use. You'll enter your token here.
// client.login logs the bot in and sets it up for use. You'll enter your token here.
client.login('MTExNTMyMzQyOTQ3MDYwOTUwOA.GsIJox.JzeD9bgk0wJLlsdy2Elp-KehqnktnII9qy4kuE');


async function checkNFTowner(ownerAddress) {
  console.log(clientAPI);
  const allCollectionsOwned = await clientAPI("post", "/getCollections", {
      limit: 10000,
      offset: 0,
      sort: -1,
      isActive: true
  });
  let data = await Promise.all(
      allCollectionsOwned?.map(async (collection) => {
          const options = {
              collection_address: collection.nftContractAddress,
              owner: ownerAddress,
              limit: 10000,
              offset: 0,
              sort: -1
          };

          let { ret: dataList } = await APICall.getNFTsByOwnerAndCollection(options);

          dataList = dataList.filter((item) => item.is_for_sale !== true);
          
          const data = dataList?.map((item) => {
              return { ...item, stakeStatus: 0 };
          });

          collection.listNFT = data;

          return collection;
      })
  );
  data = data.filter((item) => item.listNFT?.length > 0);
  return data[0].listNFT.length;
}
