module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "",
  DB: "grand_millenium_tech_api_server",
  dialect: "mysql",

  pool: {
    max: 5,
    min: 0,
    acquire: 300000,
    idle: 10000,
  },
};
