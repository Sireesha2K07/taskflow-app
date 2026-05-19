const express=require("express");
const { tasks }=require("../db/mockDb");
const router=express.Router();
let nextId=1;
router.get("/", (req, res) => {
  res.json(tasks.filter(t => t.userId === req.user.id));
});
router.post("/", (req, res) => {
  const { title, description, status, priority, category, dueDate }=req.body;
  if (!title) return res.status(400).json({ error: "Title required." });
  const task={
    id: nextId++,
    userId: req.user.id,
    title, description,
    status: status || "todo",
    priority: priority || "medium",
    category: category || "Other",
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  const io = req.app.get("io");
  io.emit("task:created", task);
  res.status(201).json(task);
});
router.put("/:id", (req, res) => {
  const idx = tasks.findIndex(t => t.id === +req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Not found." });
  tasks[idx]={ ...tasks[idx], ...req.body };
  const io=req.app.get("io");
  io.emit("task:updated", tasks[idx]);
  res.json(tasks[idx]);
});
router.delete("/:id", (req, res) => {
  const idx=tasks.findIndex(t => t.id === +req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: "Not found." });
  const deletedId=tasks[idx].id;
  tasks.splice(idx, 1);
  const io = req.app.get("io");
  io.emit("task:deleted", { id: deletedId });
  res.json({ message: "Deleted." });
});
module.exports=router;