const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");
const prisma = new PrismaClient();

// つぶやき
router.post("/post",isAuthenticated, async(req,res) => {
  const {content} = req.body;

  if (!content) {
    return res.status(400).json({message:"投稿内容がありません"});
  }

  try {
    const newpost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: {
        author: {
          include: {
            profile: true
          }
        }
      }
    })

    res.status(200).json(newpost);
  } catch (err) {
    console.log(err);
    res.status(500).json({message:"サーバーエラーです"});
  }

});

// 最新つぶやき取得
router.get("/get_latest_post", async(req,res) => {
  try {
    const latestsPosts = await prisma.post.findMany({
      take:10,
      orderBy: {createdAt: "desc"},
      include: {
        author: {
          include: {
            profile: true
          }
        }
      }
    });
    return res.status(200).json(latestsPosts);
  } catch (err) {
    console.log(err)
    res.status(500).json({message:"サーバーエラーです"});
  }
});

// ユーザーの投稿内容
router.get("/:userId", async(req,res) => {
  const {userId} = req.params;
  
  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true
      }
    });
    return res.status(200).json(userPosts);
  } catch (err) {
    console.log(err)
    res.status(500).json({message:"サーバーエラーです"});
  }
});

module.exports = router;