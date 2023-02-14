const express = require("express");

const app = express();
const EpubDB = require('')
const {converter} = require("./converter")


app.use(express.json());

router.get("/", async (req, res) => {
    try {
      const size = Number(req.query.size) || null
      const page = Number(req.query.page) || null
      const orders = JSON.parse(req.query.sorts) || []
      const filters1 = JSON.parse(req.query.filters) || []
      const filters = converter(filters1)
  
      const result = await EpubDB.findAndCountAll({
          //limit = size
          //offset = page * size ---->from page 0
          limit: size,
          offset: page*size,
          order: orders,
          where: filters
      });
      res.status(200).send(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});

app.listen(3001, (err) => {
  if (err) throw err;
  console.log("> Ready on http://localhost:3001");
});