const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const { users }=require("../db/mockDb");
const router=express.Router();
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required." });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: "Email already in use." });
  const hashed=await bcrypt.hash(password, 10);
  const user={ id: Date.now(), name, email, password: hashed };
  users.push(user);
  const token=jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: user.id, name, email } });
});
router.post("/login", async (req, res) => {
  const { email, password }=req.body;
  const user=users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials." });
  const valid=await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials." });
  const token=jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email } });
});
module.exports = router;