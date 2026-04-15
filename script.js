// global variables
let currentTeam = null;
let currentYear = new Date().getFullYear();
let pinnedTeams = [];
let currentTeamData = null;

showTab("teamLookup"); // show the teamLookup tab on page load (default tab)
function showTab(tabId) {
  // function showTab = Shows the selected tab and hides the others
  if (tabId === "teamLookup") {
    document.getElementById("tab-teamLookup").style.display = "block";
    document.getElementById("tab-customAlliance").style.display = "none";
    document.getElementById("tab-allianceBoard").style.display = "none";
    document.getElementById("tab-eventBrowser").style.display = "none";
  }
  if (tabId === "customAlliance") {
    document.getElementById("tab-teamLookup").style.display = "none";
    document.getElementById("tab-customAlliance").style.display = "block";
    document.getElementById("tab-allianceBoard").style.display = "none";
    document.getElementById("tab-eventBrowser").style.display = "none";
  }
  if (tabId === "allianceBoard") {
    document.getElementById("tab-teamLookup").style.display = "none";
    document.getElementById("tab-customAlliance").style.display = "none";
    document.getElementById("tab-allianceBoard").style.display = "block";
    document.getElementById("tab-eventBrowser").style.display = "none";
  }
  if (tabId === "eventBrowser") {
    document.getElementById("tab-teamLookup").style.display = "none";
    document.getElementById("tab-customAlliance").style.display = "none";
    document.getElementById("tab-allianceBoard").style.display = "none";
    document.getElementById("tab-eventBrowser").style.display = "block";
  }
}

async function getTeam() {
  // function getTeam = fetches and displays team data based on user input
  const loader = document.getElementById("loadingIcon");
  loader.style.display = "inline-block";

  const teamNumber = document.getElementById("teamInput").value;
  let selectedYear = document.getElementById("yearSelect").value;

  if (teamNumber !== currentTeam) {
    // if team number changed, reset selected year to the current year
    selectedYear = currentYear;
    currentTeam = teamNumber;
  }

  if (!teamNumber) {
    // if no team number is entered, display an error message and stop loading
    document.getElementById("teamOutput").textContent =
      "Please enter a team number.";
    loader.style.display = "none";
    return;
  }

  try {
    // fetching team data from statbotics API
    const response = await fetch(
      `https://api.statbotics.io/v3/team_year/${teamNumber}/${selectedYear}`,
    );

    if (!response.ok) {
      // error if fetch not successful
      throw new Error("Team not found or API error");
    }
    const data = await response.json();

    document.getElementById("yearSelect").innerHTML = "";
    for (
      // provide year dropdown with valid years for the team (populate)
      let year = Math.max(2002, data.rookie_year);
      year <= currentYear;
      year++
    ) {
      document.getElementById("yearSelect").innerHTML +=
        `<option value="${year}">${year}</option>`;
    }

    document.getElementById("yearSelect").value = selectedYear;

    document.getElementById("teamOutput").innerHTML =
      // display team data in output
      '<button id="pinButton" onclick="pinTeam()">Pin Team</button><br><br>' +
      `<strong>Team:</strong> ${data.team}<br>` +
      `<strong>Team Name:</strong> ${data.name}<br>` +
      `<strong>Rookie Year:</strong> ${data.rookie_year}<br>` +
      `<strong>EPA (Current):</strong> ${data.epa.breakdown.total_points}<br>` +
      `<strong>Auto EPA:</strong> ${data.epa.breakdown.auto_points}<br>` +
      `<strong>Teleop EPA:</strong> ${data.epa.breakdown.teleop_points}<br>` +
      `<strong>Wins:</strong> ${data.record.wins} | <strong>Losses:</strong> ${data.record.losses}`;
    currentTeamData = data;
  } catch (error) {
    // display error message if fetch fails
    document.getElementById("teamOutput").textContent =
      "Error fetching team data: " + error.message;
  }

  loader.style.display = "none";
}

async function getCustomAlliance() {
  // function getCustomAlliance = fetches and displays data for a custom user-made alliance
  const loader = document.getElementById("customLoadingIcon");
  loader.style.display = "inline-block";
  const customteam1 = document.getElementById("customTeam1").value;
  const customteam2 = document.getElementById("customTeam2").value;
  const customteam3 = document.getElementById("customTeam3").value;
  const selectedYear = document.getElementById("yearSelect").value;

  if (!customteam1 || !customteam2 || !customteam3) {
    // if any of the team numbers are missing, display an error message and stop loading
    document.getElementById("customAllianceOutput").textContent =
      "Please enter all three team numbers.";
    loader.style.display = "none";
    return;
  }

  try {
    // fetching data for all three teams in the alliance in parallel using Promise.all
    const [data1, data2, data3] = await Promise.all([
      fetch(
        `https://api.statbotics.io/v3/team_year/${customteam1}/${currentYear}`,
      ).then((r) => {
        if (!r.ok) throw new Error("Team not found or API error");
        return r.json();
      }),
      fetch(
        `https://api.statbotics.io/v3/team_year/${customteam2}/${currentYear}`,
      ).then((r) => {
        if (!r.ok) throw new Error("Team not found or API error");
        return r.json();
      }),
      fetch(
        `https://api.statbotics.io/v3/team_year/${customteam3}/${currentYear}`,
      ).then((r) => {
        if (!r.ok) throw new Error("Team not found or API error");
        return r.json();
      }),
    ]);

    const allianceEPA =
      // calculate total alliance EPA by summing the total EPA of all three teams
      data1.epa.breakdown.total_points +
      data2.epa.breakdown.total_points +
      data3.epa.breakdown.total_points;

    const averageEPA = allianceEPA / 3;

    //this function was partially written by Copilot
    const bestTeam = [data1, data2, data3].reduce((max, team) => {
      return team.epa.breakdown.total_points > max.epa.breakdown.total_points
        ? team
        : max;
    });

    document.getElementById("customAllianceOutput").innerHTML =
      // display the data for all three teams and the total alliance EPA in the output
      `<strong>Team 1:</strong> ${data1.team} (${data1.name}) - EPA Norm: ${data1.epa.norm}<br>` +
      `<strong>Total EPA:</strong> ${data1.epa.breakdown.total_points}<br>` +
      `<strong>Auto EPA:</strong> ${data1.epa.breakdown.auto_points}<br>` +
      `<strong>Teleop EPA:</strong> ${data1.epa.breakdown.teleop_points}<br><br>` +
      `<strong>Team 2:</strong> ${data2.team} (${data2.name}) - EPA Norm: ${data2.epa.norm}<br>` +
      `<strong>Total EPA:</strong> ${data2.epa.breakdown.total_points}<br>` +
      `<strong>Auto EPA:</strong> ${data2.epa.breakdown.auto_points}<br>` +
      `<strong>Teleop EPA:</strong> ${data2.epa.breakdown.teleop_points}<br><br>` +
      `<strong>Team 3:</strong> ${data3.team} (${data3.name}) - EPA Norm: ${data3.epa.norm}<br>` +
      `<strong>Total EPA:</strong> ${data3.epa.breakdown.total_points}<br>` +
      `<strong>Auto EPA:</strong> ${data3.epa.breakdown.auto_points}<br>` +
      `<strong>Teleop EPA:</strong> ${data3.epa.breakdown.teleop_points}<br><br>` +
      `<strong>Total Alliance EPA:</strong> ${allianceEPA.toFixed(0)}<br>` +
      `<strong>Average Alliance EPA:</strong> ${averageEPA.toFixed(0)}<br>` +
      `<strong>Highest Contributing Team:</strong> ${bestTeam.team} (${bestTeam.name}) - EPA: ${bestTeam.epa.breakdown.total_points}`;
  } catch (error) {
    document.getElementById("customAllianceOutput").textContent =
      "Error fetching alliance data: " + error.message;
  }

  loader.style.display = "none";
}

function pinTeam() {
  if (currentTeamData === null) return;
  if (pinnedTeams.some((team) => team.team === currentTeamData.team)) {
    // check if the team is already pinned by comparing team numbers
    alert("Team is already pinned.");
  } else {
    pinnedTeams.push({ ...currentTeamData, pinIndex: pinnedTeams.length });
    renderPinnedTeams();
  }
}

function renderPinnedTeams(teamData) {
  const pinnedTeamsContainer = document.getElementById("pinnedTeams");
  pinnedTeamsContainer.innerHTML = "";
  pinnedTeams.forEach((team) => {
    const teamElement = document.createElement("div");
    teamElement.classList.add("pinned-team");
    teamElement.innerHTML =
      `<strong>Team:</strong> ${team.team} - ${team.name}<br>` +
      `<strong>Rookie Year:</strong> ${team.rookie_year}<br>` +
      `<strong>EPA (Current):</strong> ${team.epa.breakdown.total_points}<br>` +
      `<strong>Auto EPA:</strong> ${team.epa.breakdown.auto_points}<br>` +
      `<strong>Teleop EPA:</strong> ${team.epa.breakdown.teleop_points}<br>` +
      `<strong>Wins:</strong> ${team.record.wins} | <strong>Losses:</strong> ${team.record.losses}<br>` +
      '<button onclick="removePinnedTeam(' +
      team.team +
      ')">Remove</button>';
    pinnedTeamsContainer.appendChild(teamElement);
  });
}

function removePinnedTeam(teamNumber) {
  pinnedTeams = pinnedTeams.filter((team) => team.team !== teamNumber);
  renderPinnedTeams();
}

// the two functions below were partially written by Copilot
async function sortPinnedTeams(parameter) {
  pinnedTeams.sort((a, b) => {
    if (parameter === "epa") {
      return b.epa.breakdown.total_points - a.epa.breakdown.total_points;
    } else if (parameter === "rookie_year") {
      return b.rookie_year - a.rookie_year;
    } else if (parameter === "pin_order") {
      return a.pinIndex - b.pinIndex;
    }
  });
  renderPinnedTeams();
}

for (let year = 2002; year <= currentYear; year++) {
  // populate the year dropdown with all years from 2002 to the current year on page load
  document.getElementById("yearSelect").innerHTML +=
    `<option value="${year}">${year}</option>`;
}
document.getElementById("yearSelect").value = currentYear; // set the default selected year to the current year on page load
