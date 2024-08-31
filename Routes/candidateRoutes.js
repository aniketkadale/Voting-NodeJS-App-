const express = require("express");
const router = express.Router();
const Candidate = require("./../Models/Candidate");
const User = require("./../Models/User");
const { jwtAuthMiddleware } = require("./../jwt");

const checkAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user?.role === "admin";
};

// create a new candidate/उमेदवार for election only if the user has admin privileges
router.post("/", jwtAuthMiddleware, async (req, res) => {
  if (!(await checkAdmin(req.user.id)))
    return res.status(404).json({ message: "Not an admin..." });

  const data = req.body;
  const newCandidate = new Candidate(data);

  try {
    const response = await newCandidate.save();
    console.log("New candidate created...");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Intern error while creating a candidate..." });
  }
});

// update candidate
router.post("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id)))
      return res.status(404).json({ message: "Not an admin..." });

    const candidateID = req.params.candidateID;
    const updatedCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res.status(404).json({ message: "Candidate not found..." });
    }

    console.log("Candidate data updated...");
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal server error while updating a candidate..." });
  }
});

// delete a candidate
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdmin(req.user.id)))
      return res.status(404).json({ message: "Not an admin..." });

    const candidateID = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ message: "Candidate not found..." });
    }

    console.log("Candidate deleted...");
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal server error whilte deleting a candidate..." });
  }
});

// voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userID = req.user.id;
  
  try {
    const candidate = await Candidate.findById(candidateID);
    if (!candidate)
      res
        .status(404)
        .json({ message: "Cannot vote as no such candidate exists..." });

    const user = await User.findById(userID);
    if (!user)
      res
        .status(404)
        .json({ message: "Cannot vote as no such user exists..." });

    if (user.has_Voted) {
      return res.status(400).json({ message: "You have already voted..." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin cannot vote..." });
    }

    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();
    user.has_Voted = true;
    await user.save();
    return res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal server error while voting...",
    });
  }
});

// get vote count 
router.get('/vote/count', async(req, res) => {
    try {
        const candidate = await Candidate.find().sort({votes: 'desc'});
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
        
        return res.status(200).json(voteRecord);

    } catch(error) {
          res.status(500)
          .json({
            error: "Internal server error counting votes...",
          });
    }
})

// Get all candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidate = await Candidate.find();
    console.log("All candidates fetched...");
    return res.status(200).json(candidate);
  } catch(err) {
    console.log(err);
    res.status(500).json({error: "Internal server error while fetching all candidates..."});
  }
})

module.exports = router;
