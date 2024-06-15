const express = require("express");
const router = express.Router();
const User = require('./../models/user');
const Candidate = require("./../models/candidate");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// Function to check admin role
const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID); // Assuming you have a User model to check roles
    if (user.role === 'admin') {
      return true;
    }
  } catch (err) {
    return false;
  }
};

router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const data = req.body; // This contains the candidate data
    const newCandidate = new Candidate(data);

    // Save the new candidate to the database
    const response = await newCandidate.save();
    console.log("Data Saved");

    // Sending response as well as token
    return res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const candidateId = req.params.candidateID;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate data Updated");
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }

    const candidateId = req.params.candidateID;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate Deleted");
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateID;
  const userId = req.user.id;

  try {
    // Find candidate with specific candidate ID
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admin is not allowed to vote' });
    }

    // Update candidate documents to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    // Update user document
    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Vote count
router.get('/vote/count', async (req, res) => {
  try {
    // Find all candidates and sort them in descending order of votes
    const candidate = await Candidate.find().sort({ voteCount: 'desc' });

    // Map candidates and only return their name and vote count
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount
      };
    });
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/' , async (req , res)=>{
    try{
        const data = await Candidate.find();
        console.log('Data fetched Sucessfully');
        res.status(200).json(data);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : 'Internal Server Error'});
    }
})

module.exports = router;

