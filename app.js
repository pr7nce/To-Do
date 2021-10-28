const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _ =require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://its-me:mario@cluster0.76uuu.mongodb.net/todolistDB", {useNewUrlParser:true});


const itemsSchema={
  name: String,
}
const Item = mongoose.model("Item", itemsSchema);
const item1=new Item({
  name: "Welcome to todo list"
})
const item2=new Item({
  name: "Click + to add shit"
})
const item3=new Item({
  name: "<-- click this to cross shit"
})

const defaultItems=[item1, item2, item3];

const listSchema ={
  name: String,
  items: [itemsSchema]
}
const List=mongoose.model("List", listSchema);
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {
  Item.find({}, function(err, found){
    if(found.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Success");
        }
      })
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: found});
    }
  });
});

app.get("/:customListName", function(req, res){
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, found){
    if(!err){
      if(!found){
        const list= new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName)
      }else{
        res.render("list", {listTitle: found.name, newListItems: found.items})
      }
    }
  })
})

app.post("/", function(req, res){
const itemName = req.body.newItem;
  const listName= req.body.list;
  const item=new Item({
    name: itemName
  })
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, found){
      found.items.push(item);
      found.save();
      res.redirect("/"+ listName);
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId= req.body.checkbox;
  const checkedroute= req.body.listName;
  if(checkedroute==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name: checkedroute}, {$pull: {items: {_id: checkedItemId}}}, function(err, found){
      if(!err){
        res.redirect("/"+ checkedroute);
      }
    })
  }
  })

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port successfully");
});
