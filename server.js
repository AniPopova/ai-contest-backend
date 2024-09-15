const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const sgClient = require("@sendgrid/client");
const helmet = require("helmet");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка на SendGrid API ключове
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

app.use(cors());
app.use(express.json());
app.use(helmet());

app.post("/register", async (req, res) => {
  const { name, email, position } = req.body;

  const listId =
    position === "CEO" ? process.env.CEO_LIST_ID : process.env.HR_LIST_ID;

  const data = {
    contacts: [
      {
        email: email,
        first_name: name,
      },
    ],
    list_ids: [listId],
  };

  try {
    await sgClient.request({
      method: "PUT",
      url: "/v3/marketing/contacts",
      body: data,
    });

    const msg = {
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: "Потвърждение за регистрация",
      html: `
        <p>Здравейте, ${name}!</p>
        <p>Благодарим ви за регистрацията за нашето събитие.</p>
      `,
    };

    await sgMail.send(msg);

    res
      .status(200)
      .send({ message: "Регистрацията е успешна! Имейлът е изпратен." });
  } catch (error) {
    console.error("Грешка при регистрацията:", error);
    res.status(500).send({
      error: "Възникна грешка при регистрацията. Моля, опитайте отново.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Сървърът работи на порт ${PORT}`);
});
