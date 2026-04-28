// Political problems:
// Max store prices
// Burning prime numbers for energy: energy vs. health problems (unimplemented)

let travelPrice = 0.000001;
let maxStorePrice = 25;
let storeIDCounter = 0;
let storesShuttingDownIsBadCampaign = {politicalPositions: [25], cats: []};

function randomLocation(){
    return [Math.random()*1000000, Math.random()*1000000];
}

let cats = [];
let stores = [];
for (let i=0; i<2000; i++) {
    let cat = {
        id: cats.length,
        location: randomLocation(),
        jobs: [],
        money: 50,
        favoriteStore: undefined,
        favoriteStorePrice: undefined,
        politicalPositions: [Math.random()*20+10],
        formerStoreOwner: false
    }
    if (Math.random() < 1/20) {
        let store = {id: storeIDCounter, type: "store", location: cat.location, owner: cat, price: Math.random()*20+10, profit: 0, customers: 0};
        cat.jobs.push(store);
        stores.push(store);
        cat.politicalPositions[0] = store.price;
        storeIDCounter ++;
    }
    cats.push(cat);
}

function simulateWeek(){
    for (let i=0; i<cats.length; i++) {
        let cat = cats[i];
        let store = cat.favoriteStore;
        if (Math.random() < 0.1 || cat.favoriteStore == undefined || cat.favoriteStorePrice > 15) {
            store = pickNearbyStore(cat, 10**(Math.random()*12-6));
        }
        if (store.price > maxStorePrice) {
            store.price = maxStorePrice;
        }
        let price = Math.sqrt(getDistSquared(...cat.location, ...store.location))*travelPrice*2 + store.price;
        cat.money -= price;
        store.profit += price-13;
        store.customers ++;
        if (cat.favoriteStorePrice > price || cat.favoriteStorePrice == undefined) {
            cat.favoriteStore = store;
        }
        if (store.id == cat.favoriteStore.id) {
            cat.favoriteStorePrice = price;
        }
        if (cat.jobs.length == 1) {
            cat.money += cat.jobs[0].profit;
            cat.jobs[0].profit = 0;
        } else {
            cat.money += 15;
        }
        if (cat.money > 50) {
            if (Math.random() < storesShuttingDownIsBadCampaign.cats.length/200+(200-stores.length)/200) {
                if (cat.politicalPositions[0] < storesShuttingDownIsBadCampaign.politicalPositions[0]) {
                    cat.politicalPositions[0] = storesShuttingDownIsBadCampaign.politicalPositions[0];
                }
            }
            let average = 0;
            let numbersAveraged = 0;
            for (let j=0; j<10; j++) {
                let value = cats[Math.floor(Math.random()*cats.length)].politicalPositions[0];
                if (Math.abs(cat.politicalPositions[0]-value) < 10) {
                    average += value;
                    numbersAveraged ++;
                }
            }
            if (numbersAveraged > 0) {
                average /= numbersAveraged;
                cat.politicalPositions[0] = (cat.politicalPositions[0]+average)/2;
            }
        }
        if (cat.money < 0) {
            if (cat.jobs.length == 1) {
                cat.jobs[0].price -= cat.money*5/cat.jobs[0].customers;
                cat.politicalPositions[0] = cat.jobs[0].price;
                tellCustomersToSupportPrice(cat.jobs[0]);
                storesShuttingDownIsBadCampaignAddCat(cat);
                if (cat.money < -500) {
                    removeStore(cat.jobs[0]);
                }
            } else if (!cat.formerStoreOwner) {
                cat.politicalPositions[0] -= 0.5;
            }
        }
    }
}

function storesShuttingDownIsBadCampaignAddCat(cat){
    let cats2 = storesShuttingDownIsBadCampaign.cats;
    let newMember = true;
    for (let i=0; i<cats2.length; i++) {
        if (cat.id == cats2[i].id) {
            newMember = false;
            return;
        }
    }
    if (newMember) {
        storesShuttingDownIsBadCampaign.cats.push(cat);
        for (let i=0; i<cats2.length; i++) {
            if (cats2[i].politicalPositions[0] < 13) {
                cats2.splice(i, 1);
                i --;
            }
        }
        let pos = 0;
        for (let i=0; i<cats2.length; i++) {
            pos += cats2[i].politicalPositions[0]/cats2.length;
        }
        storesShuttingDownIsBadCampaign.politicalPositions[0] = pos;
    }
}

function tellCustomersToSupportPrice(store){
    for (let i=0; i<cats.length; i++) {
        let cat = cats[i];
        if (cat.favoriteStore != undefined) {
            if (cat.favoriteStore.id == store.id && cat.money > 0) {
                if (cat.politicalPositions[0] < store.price) {
                    cat.politicalPositions[0] = store.price;
                }
            }
        }
    }
}

function pickNearbyStore(cat, maxDistSquared){
    let nearbyStores = findNearbyStores(cat, maxDistSquared);
    if (nearbyStores.length == 0) {
        cat.politicalPositions[0] += 0.01;
        return pickNearbyStore(cat, maxDistSquared*10);
    }
    return nearbyStores[Math.floor(Math.random()*nearbyStores.length)];
}

function findNearbyStores(cat, maxDistSquared){
    let nearbyStores = [];
    for (let i=0; i<stores.length; i++) {
        if (getDistSquared(...cat.location, ...stores[i].location) < maxDistSquared) {
            nearbyStores.push(stores[i]);
        }
    }
    return nearbyStores;
}

function getDistSquared(x1, y1, x2, y2){
    return (x1-x2)**2 + (y1-y2)**2;
}

let states = [];
for (let i=0; i<25; i++) {
    states.push({cats: []});
}
for (let i=0; i<cats.length; i++) {
    let cat = cats[i];
    let stateIndex = Math.floor(cat.location[0]/200000)*5+Math.floor(cat.location[1]/200000);
    states[stateIndex].cats.push(cat);
    cat.state = stateIndex;
}

let reps = [];

for (let ii=0; ii<50; ii++) {
    for (let i=0; i<12; i++) {
        simulateWeek();
    }
    reps = [];
    for (let i=0; i<states.length; i++) {
        let state = states[i];
        let candidates = generateCandidates(state.cats);
        state.rep = getWinnerPluralityVote(state.cats, candidates).winner;
        reps.push(state.rep);
    }
    let winner = getWinnerPluralityVote(reps, [{politicalPositions: [maxStorePrice]}, {politicalPositions: [maxStorePrice+Math.floor(Math.random()*11)-5]}]);
        maxStorePrice = winner.winner.politicalPositions[0];
    if (maxStorePrice < 0) {
        maxStorePrice = 0;
    }
    console.log("Term "+ii);
    console.log("Max legal food price: "+maxStorePrice);
    console.log("Max food price wanted by stores: "+storesShuttingDownIsBadCampaign.politicalPositions[0]);
    console.log("Members of the Stores Shutting Down is Bad Campaign: "+storesShuttingDownIsBadCampaign.cats.length);
}

function removeStore(store){
    store.owner.jobs = [];
    store.owner.formerStoreOwner = true;
    for (let i=0; i<stores.length; i++) {
        if (stores[i].id == store.id) {
            stores.splice(i, 1);
            break;
        }
    }
    for (let i=0; i<cats.length; i++) {
        let cat = cats[i];
        if (cat.favoriteStore != undefined) {
            if (cat.favoriteStore.id == store.id) {
                cat.favoriteStore = undefined;
                cat.favoriteStorePrice = undefined;
            }
        }
    }
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

