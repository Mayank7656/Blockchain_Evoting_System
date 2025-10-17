// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Simple Blockchain Voting System
 * @author 
 * @notice This contract allows an admin to register candidates and users to vote once.
 * @dev Compatible with Web3.js or Ethers.js frontends.
 */
contract Voting {
    address public admin;
    bool public votingActive;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    uint256 public candidatesCount;
    mapping(uint256 => Candidate) public candidates;
    mapping(string => uint256) private nameToId;
    mapping(address => bool) public hasVoted;

    // ---------- Events ----------
    event CandidateAdded(uint256 indexed id, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId, string candidateName);
    event VotingStatusChanged(bool isActive);

    // ---------- Modifiers ----------
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier whenVotingActive() {
        require(votingActive, "Voting is not active");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // ---------- Admin Functions ----------

    /// @notice Add a candidate before voting starts.
    /// @param _name Candidate's name.
    function addCandidate(string memory _name) public onlyAdmin {
        require(!votingActive, "Cannot add candidates while voting is active");
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        require(nameToId[_name] == 0, "Candidate already exists");

        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        nameToId[_name] = candidatesCount;

        emit CandidateAdded(candidatesCount, _name);
    }

    /// @notice Start or stop voting (toggle).
    function toggleVoting() public onlyAdmin {
        votingActive = !votingActive;
        emit VotingStatusChanged(votingActive);
    }

    // ---------- Voting Function ----------

    /// @notice Allows a user to vote for an existing candidate by name.
    /// @param _name Candidate name.
    function vote(string memory _name) public whenVotingActive {
        require(!hasVoted[msg.sender], "You have already voted");
        uint256 id = nameToId[_name];
        require(id > 0, "Candidate does not exist");

        candidates[id].voteCount++;
        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, id, _name);
    }

    // ---------- View Functions ----------

    /// @notice Returns the winning candidate.
    /// @return winnerName The name of the winner.
    /// @return winnerVoteCount The number of votes received.
    function getWinner() public view returns (string memory winnerName, uint256 winnerVoteCount) {
        uint256 maxVotes = 0;
        uint256 winnerId = 0;

        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        if (winnerId == 0) {
            return ("No winner yet", 0);
        }

        Candidate memory c = candidates[winnerId];
        return (c.name, c.voteCount);
    }

    /// @notice Returns candidate info by ID.
    /// @param _id Candidate ID.
    function getCandidate(uint256 _id) public view returns (uint256, string memory, uint256) {
        require(_id > 0 && _id <= candidatesCount, "Invalid candidate ID");
        Candidate memory c = candidates[_id];
        return (c.id, c.name, c.voteCount);
    }

    /// @notice Returns the total number of candidates.
    function getTotalCandidates() public view returns (uint256) {
        return candidatesCount;
    }
}
