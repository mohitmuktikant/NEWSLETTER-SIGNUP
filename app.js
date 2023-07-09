const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mailchimp = require("@mailchimp/mailchimp_marketing");

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

mailchimp.setConfig({
    apiKey: "03f47726a84c1c32a90b487d0ae572dd-us9",
    server: "us9"
});

let subscribingUser = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

app.post('/', async (req, res) => {
    subscribingUser = {
        firstName: req.body.fName,
        lastName: req.body.lName,
        email: req.body.email
    };

    console.log(subscribingUser);

    try {
        await run();
        res.sendFile(__dirname + "/success.html");
    } catch (error) {
        console.log('Error:', error);
        res.sendFile(__dirname + "/failure.html");
    }
});

async function run() {
    try {
        const response = await mailchimp.lists.addListMember('fd27e43b0e', {
            email_address: subscribingUser.email,
            status: 'subscribed',
            merge_fields: {
                FNAME: subscribingUser.firstName,
                LNAME: subscribingUser.lastName
            }
        });

        console.log(`Successfully added contact as an audience member. The contact's id is ${response.id}.`);
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

app.post("/failure", (req,res)=>{
    res.redirect("/");
})

async function callPing() {
    const response = await mailchimp.ping.get();
    console.log(response);
}

callPing();

app.listen(port, () => {
    console.log('Server Started on Port 3000');
});
