import { clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const tailwindConfig = () => {
  // Tailwind config
  return resolveConfig("../tailwind.config");
};

export const hexToRGB = (h) => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (h.length === 4) {
    r = `0x${h[1]}${h[1]}`;
    g = `0x${h[2]}${h[2]}`;
    b = `0x${h[3]}${h[3]}`;
  } else if (h.length === 7) {
    r = `0x${h[1]}${h[2]}`;
    g = `0x${h[3]}${h[4]}`;
    b = `0x${h[5]}${h[6]}`;
  }
  return `${+r},${+g},${+b}`;
};

export const formatValue = (value) =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
    notation: "compact",
  }).format(value);

export function getStartingLetters(inputString) {
  if (!inputString) return;
  const wordsArray = inputString.split(" ");
  const startingLetters = wordsArray.map((word) => word.charAt(0));
  return startingLetters.join("").slice(0, 4);
}

export const convertObjectToOptions = (object) => {
  return Object.entries(object)
    .map(([key, value]) => {
      if (value === "PLAYED") {
        return null; // Exclude PLAYED option
      }
      return {
        label: value,
        value: key,
      };
    })
    .filter((option) => option !== null); // Filter out excluded options
};

export function calculateWinner(teams) {
  // Check for walkover cases
  const walkoverTeam1 = teams[0].walkover === true;
  const walkoverTeam2 = teams[1].walkover === true;

  if (walkoverTeam1 && !walkoverTeam2) {
    return { winner: teams[1], loser: teams[0] };
  } else if (!walkoverTeam1 && walkoverTeam2) {
    return { winner: teams[0], loser: teams[1] };
  }

  // Calculate goals
  const totalGoalsTeam1 = teams[0].goals.length;
  const totalGoalsTeam2 = teams[1].goals.length;

  if (totalGoalsTeam1 !== totalGoalsTeam2) {
    // Winner based on goals
    return totalGoalsTeam1 > totalGoalsTeam2
      ? { winner: teams[0], loser: teams[1] }
      : { winner: teams[1], loser: teams[0] };
  }

  // If goals are tied, check penalty shootout
  const totalShootoutTeam1 = teams[0].penaltyShoot.filter(Boolean).length;
  const totalShootoutTeam2 = teams[1].penaltyShoot.filter(Boolean).length;

  if (totalShootoutTeam1 !== totalShootoutTeam2) {
    // Winner based on penalty shootout
    return totalShootoutTeam1 > totalShootoutTeam2
      ? { winner: teams[0], loser: teams[1] }
      : { winner: teams[1], loser: teams[0] };
  }

  // If everything is tied, declare a tie
  return { winner: "TIE", loser: "" };
}

export function addSuffixToMinute(minute) {
  if (minute === 11 || minute === 12 || minute === 13) {
    return minute + "th";
  } else {
    const lastDigit = minute % 10;
    switch (lastDigit) {
      case 1:
        return minute + "st";
      case 2:
        return minute + "nd";
      case 3:
        return minute + "rd";
      default:
        return minute + "th";
    }
  }
}

export function generateCommentary(matchData) {
  const commentaryArray = [];

  const team1 = matchData.participants[0].families.familyName;
  const team2 = matchData.participants[1].families.familyName;
  const goalsTeam1 = matchData.participants[0].goals;
  const goalsTeam2 = matchData.participants[1].goals;
  let winner = null;

  commentaryArray.push(`Exciting match between ${team1} & ${team2}!`);

  // Combine and sort all goals
  const allGoals = [...goalsTeam1, ...goalsTeam2];
  allGoals.sort((a, b) => a.minute - b.minute);

  allGoals.forEach((goal) => {
    const teamName = matchData.participants.find((participant) =>
      participant.goalsId.includes(goal.id)
    ).families.familyName;
    commentaryArray.push(
      `It's a goal! ${teamName.charAt(0).toUpperCase() + teamName.slice(1)}'s ${
        goal.players[0].playerName.charAt(0).toUpperCase() +
        goal.players[0].playerName.slice(1)
      } scored at ${addSuffixToMinute(goal.minute)} minute as ${goal.type} goal`
    );
  });

  if (
    matchData.participants[0].penaltyShoot.length > 0 ||
    matchData.participants[1].penaltyShoot.length > 0
  ) {
    commentaryArray.push("The match went into a shootout.");
  }

  if (matchData.status === "PLAYED") {
    //check walkover
    if (matchData.participants[0].walkover === true) {
      winner = team2;
      commentaryArray.push(
        `Team ${team1.charAt(0).toUpperCase() + team1.slice(1)} gave walkover`
      );
    } else if (matchData.participants[1].walkover === true) {
      winner = team1;
      commentaryArray.push(
        `Team ${team2.charAt(0).toUpperCase() + team2.slice(1)} gave walkover`
      );
    }

    // If both teams have the same number of goals, consider shootout
    const totalShootoutTeam1 =
      matchData.participants[0].penaltyShoot.filter(Boolean).length;
    const totalShootoutTeam2 =
      matchData.participants[1].penaltyShoot.filter(Boolean).length;

    // Check if team 1 scored more goals than team 2
    const totalGoalsTeam1 = goalsTeam1.length;
    const totalGoalsTeam2 = goalsTeam2.length;

    if (totalGoalsTeam1 > totalGoalsTeam2) {
      winner = team1;
    } else if (totalGoalsTeam1 < totalGoalsTeam2) {
      winner = team2;
    }

    // Determine the winner based on the shootout
    if (totalShootoutTeam1 > totalShootoutTeam2) {
      winner = team1;
    } else if (totalShootoutTeam1 < totalShootoutTeam2) {
      winner = team2;
    }

    commentaryArray.push(
      `The winner of the match is ${
        winner.charAt(0).toUpperCase() + winner.slice(1)
      }`
    );
  }

  return commentaryArray;
}

//get random sponsor
export function getRandomSponsorUrl(sponsorsArray) {
  // Create a copy of the sponsors array to avoid mutating the original array
  const shuffledSponsors = [...sponsorsArray];

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = shuffledSponsors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledSponsors[i], shuffledSponsors[j]] = [
      shuffledSponsors[j],
      shuffledSponsors[i],
    ];
  }

  // Get the URL of the first sponsor in the shuffled array
  const randomSponsor = shuffledSponsors[0];
  return randomSponsor.url;
}

export const formattedScheduledOnDate = (date) =>
  format(new Date(date), "dd/MM/yy");
export const formattedScheduledOnTime = (date) =>
  format(new Date(date), "hh:mm a");

export const removeUnderScore = (item) => {
  return item.split("_").join(" ");
};

// Slugify a string
export const slugify = (text) => {
  return text
    .toString()
    .normalize("NFKD") // separate accented chars
    .replace(/[\u0300-\u036f]/g, "") // remove diacritic marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // spaces -> hyphens
    .replace(/-+/g, "-") // collapse hyphens
    .replace(/^-+|-+$/g, ""); // trim hyphens
};

// Generic debounce
export function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
