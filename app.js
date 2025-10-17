const contractAddress = ""; // your contract
const contractABI = [ {
	"inputs": [
		{
			"internalType": "string",
			"name": "_name",
			"type": "string"
		}
	],
	"name": "addCandidate",
	"outputs": [],
	"stateMutability": "nonpayable",
	"type": "function"
},
{
	"inputs": [],
	"stateMutability": "nonpayable",
	"type": "constructor"
},
{
	"anonymous": false,
	"inputs": [
		{
			"indexed": true,
			"internalType": "uint256",
			"name": "id",
			"type": "uint256"
		},
		{
			"indexed": false,
			"internalType": "string",
			"name": "name",
			"type": "string"
		}
	],
	"name": "CandidateAdded",
	"type": "event"
},
{
	"inputs": [],
	"name": "toggleVoting",
	"outputs": [],
	"stateMutability": "nonpayable",
	"type": "function"
},
{
	"inputs": [
		{
			"internalType": "string",
			"name": "_name",
			"type": "string"
		}
	],
	"name": "vote",
	"outputs": [],
	"stateMutability": "nonpayable",
	"type": "function"
},
{
	"anonymous": false,
	"inputs": [
		{
			"indexed": true,
			"internalType": "address",
			"name": "voter",
			"type": "address"
		},
		{
			"indexed": false,
			"internalType": "string",
			"name": "candidate",
			"type": "string"
		}
	],
	"name": "VoteCast",
	"type": "event"
},
{
	"anonymous": false,
	"inputs": [
		{
			"indexed": false,
			"internalType": "bool",
			"name": "active",
			"type": "bool"
		}
	],
	"name": "VotingToggled",
	"type": "event"
},
{
	"inputs": [],
	"name": "admin",
	"outputs": [
		{
			"internalType": "address",
			"name": "",
			"type": "address"
		}
	],
	"stateMutability": "view",
	"type": "function"
},
{
	"inputs": [
		{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}
	],
	"name": "candidates",
	"outputs": [
		{
			"internalType": "uint256",
			"name": "id",
			"type": "uint256"
		},
		{
			"internalType": "string",
			"name": "name",
			"type": "string"
		},
		{
			"internalType": "uint256",
			"name": "voteCount",
			"type": "uint256"
		}
	],
	"stateMutability": "view",
	"type": "function"
},
{
	"inputs": [],
	"name": "candidatesCount",
	"outputs": [
		{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}
	],
	"stateMutability": "view",
	"type": "function"
},
{
	"inputs": [
		{
			"internalType": "uint256",
			"name": "_id",
			"type": "uint256"
		}
	],
	"name": "getCandidate",
	"outputs": [
		{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		},
		{
			"internalType": "string",
			"name": "",
			"type": "string"
		},
		{
			"internalType": "uint256",
			"name": "",
			"type": "uint256"
		}
	],
	"stateMutability": "view",
	"type": "function"
},
{
	"inputs": [],
	"name": "getWinner",
	"outputs": [
		{
			"internalType": "string",
			"name": "winnerName",
			"type": "string"
		},
		{
			"internalType": "uint256",
			"name": "winnerVoteCount",
			"type": "uint256"
		}
	],
	"stateMutability": "view",
	"type": "function"
},
{
	"inputs": [
		{
			"internalType": "address",
			"name": "",
			"type": "address"
		}
	],
	"name": "hasVoted",
	"outputs": [
		{
			"internalType": "bool",
			"name": "",
			"type": "bool"
		}
	],
	"stateMutability": "view",
	"type": "function"
},
{
	"inputs": [],
	"name": "votingActive",
	"outputs": [
		{
			"internalType": "bool",
			"name": "",
			"type": "bool"
		}
	],
	"stateMutability": "view",
	"type": "function"
}
];

let web3, contract, account;

// ---- Connect Wallet ----
async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById("walletAddress").innerText = `Connected: ${account.slice(0,6)}...${account.slice(-4)}`;
    contract = new web3.eth.Contract(contractABI, contractAddress);
    await updateVotingStatus();
    await loadCandidates();
  } else {
    alert("Please install MetaMask!");
  }
}

// ---- Voting Status ----
async function updateVotingStatus() {
  const isActive = await contract.methods.votingActive().call();
  const toggleBtn = document.getElementById("votingToggle");

  if (isActive) {
    toggleBtn.textContent = "🟢 Voting: ON";
    toggleBtn.style.backgroundColor = "#28a745";
  } else {
    toggleBtn.textContent = "🔴 Voting: OFF";
    toggleBtn.style.backgroundColor = "#dc3545";
  }
}

// ---- Toggle Voting ----
async function toggleVoting() {
  try {
    await contract.methods.toggleVoting().send({ from: account });
    await updateVotingStatus();
    alert("✅ Voting toggled successfully!");
  } catch (err) {
    alert("❌ Toggle failed: " + err.message);
  }
}

// ---- Add Candidate ----
async function addCandidate() {
  const name = document.getElementById("candidateName").value;
  if (!name) return alert("Enter a candidate name!");

  try {
    await contract.methods.addCandidate(name).send({ from: account });
    alert(`✅ Candidate "${name}" added!`);
    document.getElementById("candidateName").value = "";
    await loadCandidates();
  } catch (err) {
    alert("❌ Error adding candidate: " + err.message);
  }
}

// ---- Vote ----
async function vote() {
  const name = document.getElementById("voteName").value;
  if (!name) return alert("Enter candidate name to vote for!");

  try {
    await contract.methods.vote(name).send({ from: account });
    alert(`🗳 Vote cast for "${name}"!`);
    document.getElementById("voteName").value = "";
    await loadCandidates();
  } catch (err) {
    alert("❌ Voting failed: " + err.message);
  }
}

// ---- Load All Candidates ----
async function loadCandidates() {
  if (!contract) return;
  const count = await contract.methods.candidatesCount().call();
  const container = document.getElementById("candidateList");
  container.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const c = await contract.methods.getCandidate(i).call();
    const div = document.createElement("div");
    div.classList.add("candidate");
    div.innerHTML = `<b>#${c[0]}</b> - ${c[1]} 🗳 Votes: ${c[2]}`;
    container.appendChild(div);
  }

  if (count == 0) {
    container.innerHTML = "<i>No candidates added yet.</i>";
  }
}
