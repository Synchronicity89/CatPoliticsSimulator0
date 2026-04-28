// Original code

let politicalPositionFactors = [];
for (let i=0; i<3; i++) {
    politicalPositionFactors.push([
        (x)=>{return x/10000+Math.random()*20-10},
        (y)=>{return y/10000+Math.random()*20-10},
    ]);
}

function generatePoliticalPositions(cat){
    let politicalPositions = [];
    for (let i=0; i<politicalPositionFactors.length; i++) {
        let newPos = 0;
        for (let j=0; j<politicalPositionFactors[i].length; j++) {
            newPos += politicalPositionFactors[i][j](cat.demographics[j]);
        }
        politicalPositions.push(newPos);
    }
    return politicalPositions;
}

let cats = [];
for (let i=0; i<2000; i++) {
    let cat = {
        id: cats.length,
        demographics: [Math.random()*1000000, Math.random()*1000000] // location
    }
    cat.politicalPositions = generatePoliticalPositions(cat);
    cats.push(cat);
}

let states = [];
for (let i=0; i<25; i++) {
    states.push({cats: []});
}
for (let i=0; i<cats.length; i++) {
    let cat = cats[i];
    let stateIndex = Math.floor(cat.demographics[0]/200000)*5+Math.floor(cat.demographics[1]/200000);
    states[stateIndex].cats.push(cat);
    cat.state = stateIndex;
}

let reps = [];
for (let i=0; i<states.length; i++) {
    let state = states[i];
    let candidates = generateCandidates(state.cats);
    state.rep = getWinnerPluralityVote(state.cats, candidates).winner;
    reps.push(state.rep);
}

function getWinnerPluralityVote(voters, candidates){
    let votes = [];
    for (let i=0; i<candidates.length; i++) {
        votes.push(0);
    }
    for (let i=0; i<voters.length; i++) {
        let voter = voters[i];
        bestCandidateIndex = getBestCandidateIndex(voter, candidates).index;
        votes[bestCandidateIndex] ++;
    }
    let winnerIndex = Math.floor(Math.random()*candidates.length);
    let winnerVotes = 0;
    for (let i=0; i<votes.length; i++) {
        if (votes[i] > winnerVotes) {
            winnerIndex = i;
            winnerVotes = votes[i];
        }
    }
    return {winner: candidates[winnerIndex], voteDist: votes};
}

function getBestCandidateIndex(voter, candidates){
    let bestCandidateIndex = Math.floor(Math.random()*candidates.length);
    let bestCandidateScore = -Infinity;
    for (let j=0; j<candidates.length; j++) {
        let candidate = candidates[j];
        candidateScore = 0;
        for (let k=0; k<voter.politicalPositions.length; k++) {
            candidateScore -= Math.abs(voter.politicalPositions[k]-candidate.politicalPositions[k]);
        }
        if (candidateScore > bestCandidateScore) {
            bestCandidateIndex = j;
            bestCandidateScore = candidateScore;
        }
    }
    return {index: bestCandidateIndex, score: bestCandidateScore};
}

function generateCandidates(cats){
    let candidates = [];
    for (let i=0; i<2; i++) {
        candidates.push(cats[Math.floor(Math.random()*cats.length)]);
    }
    for (let i=0; i<cats.length; i++) {
        if (getBestCandidateIndex(cats[i], candidates).score < Math.random()*20-30) {
            candidates.push(cats[i]);
        }
    }
    return candidates;
}

