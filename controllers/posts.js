import { Profile } from "../models/profile.js"
import { Post } from "../models/post.js"

async function create(req, res) {
  try {
    req.body.author = req.user.profile
    const post = await Post.create(req.body) 
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { posts: post } },
      { new: true }
    )
    res.status(200).json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function index(req, res) {
  try {
    const posts = await Post.find({}) 
      .populate('author')
      .sort({ createdAt: 'desc' })
    res.status(200).json(posts)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function show(req, res) {
  try {
    const post = await Post.findById(req.params.postId) 
    // .populate(['author', 'comments.author']) <= a deep populate to populate an embedded resource, AKA author of comments on the post
    res.status(200).json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function update(req, res) {
  try {
    const post = Post.findByIdAndUpdate( 
      // the thing we want to update
      req.params.postId,
      // the thing we are updating it with
      req.body,
      // the thing we're updating it with is new
      { new: true }
    )
    // .populate('author') <= populate the author before we send it back
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function deletePost(req, res) {
  try {
   const post = await Post.findByIdAndDelete(req.params.postId)
   const profile=await Profile.findById(req.user.profile)
   profile.posts.remove({_id:req.params.postId})
   await profile.save()
   res.status(200).json(post)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function createComment(req, res) {
  try {
    req.body.author = req.user.profile
    const post = await Post.findById(req.params.postId)
    post.comments.push(req.body)
    await post.save()
    const newComment = post.comments[post.comments.length - 1]
    const profile = await Profile.findById(req.user.profile)
    newComment.author = profile
    res.status(201).json(newComment)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

async function updateComment(req, res) {
  try {
    const test = await Post.updateOne(
      { _id : req.params.postId,"comments._id" :req.params.commentId},
      { $set : {"comments.$.text" : req.body.text}}
    )
    const post = await Post.findById(req.params.postId)
    const comment = post.comments.id(req.params.commentId)
    res.status(200).json(comment)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
async function deleteComment(req, res) {
  try {
    const post = await Post.findById(req.params.postId)
    const comment = post.comments.id(req.params.commentId)
    comment.deleteOne()
    await post.save()
    res.status(200).json(comment)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export {
  create,
  index,
  show,
  update,
  deletePost as delete,
  createComment,
  updateComment,
  deleteComment
}