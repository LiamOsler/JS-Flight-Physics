
// Define the initial parameters
const initialLength = 1
const initialAngle = -Math.PI / 2;
const initialX = 0;
const initialY = 0;
const angleVariation = Math.PI / 6;
const lengthReductionFactor = .1;
const recursionLimit = 4;

// Function to draw a line segment

// Recursive function to generate the snowflake
function generateSnowflake(x, y, length, angle, depth, snowflake) {
    console.log(snowflake)
  if (depth > recursionLimit) {
    return snowflake;
  }

  const x2 = x + length * Math.cos(angle);
  const y2 = y + length * Math.sin(angle);

  snowflake.push([x, y, x2, y2])

  const nextLength = length * lengthReductionFactor;
  const randomAngle = angle + (Math.random() * 2 - 1) * angleVariation;

  generateSnowflake(x2, y2, nextLength, randomAngle + Math.PI / 3, depth + 1, snowflake);
  generateSnowflake(x2, y2, nextLength, randomAngle - Math.PI / 3, depth + 1, snowflake);
//   generateSnowflake(x2, y2, nextLength, angle + Math.PI, depth + 1);
}


const snowflake = [];
generateSnowflake(initialX, initialY, initialLength, initialAngle, 0, snowflake);



// Start generating the snowflake
