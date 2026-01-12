export function calculateMatchScore(
  jobDescription: string,
  jobLocation: string,
  skills: string[],
  country: string
) {
  let score = 0;

  const desc = jobDescription.toLowerCase();
  const loc = jobLocation.toLowerCase();

  // Skills match (60%)
  const matchedSkills = skills.filter(s =>
    desc.includes(s.toLowerCase())
  );
  score += Math.min(60, matchedSkills.length * 10);

  // Location match (20%)
  if (loc.includes("remote")) score += 20;
  else if (loc.includes(country.toLowerCase())) score += 20;

  // Keyword bonus (20%)
  if (desc.includes("experience")) score += 10;
  if (desc.includes("developer") || desc.includes("engineer")) score += 10;

  return Math.min(score, 100);
}
