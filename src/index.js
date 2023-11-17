import { Engine, Render, Bodies, Runner, World, Body, Events } from "matter-js";
import { FRUITS } from "./fruits";
const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850
  }
});
const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});
const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});
const topLine = Bodies.rectangle(310, 150, 620, 1, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
});

World.add(world, [leftWall, rightWall, ground, topLine]);
Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let score = 0;

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `public/${fruit.name}.png` }
    }
  });
  currentBody = body;
  currentFruit = fruit;
  World.add(world, body);
}
function handleKeyDown(event) {
  if (disableAction) {
    return;
  }
  switch (event.key) {
    case "KeyA":
      if (currentBody.position.x - currentFruit.radius > 30)
        Body.setPosition(currentBody, {
          x: currentBody.position.x - 3,
          y: currentBody.position.y
        });
      break;
    case "KeyD":
      if (currentBody.position.x + currentFruit.radius < 590)
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 3,
          y: currentBody.position.y
        });
      break;
  }
}
document.addEventListener("keypress", handleKeyDown);
setInterval(function () {
  var fakeEvent = new Event("keydown");
  handleKeyDown(fakeEvent);
}, 1000);

// window.onkeypress = (event) => {
//   if (disableAction) {
//     return;
//   }
//   switch (event.code) {
//     case "KeyA":
//       if (currentBody.position.x - currentFruit.radius > 30)
//         Body.setPosition(currentBody, {
//           x: currentBody.position.x - 3,
//           y: currentBody.position.y
//         });
//       break;
//     case "KeyD":
//       if (currentBody.position.x + currentFruit.radius < 590)
//         Body.setPosition(currentBody, {
//           x: currentBody.position.x + 3,
//           y: currentBody.position.y
//         });
//       break;
//   }
// };
window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }
  switch (event.code) {
    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
};
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index == collision.bodyB.index) {
      const index = collision.bodyA.index;
      score += FRUITS[index].score;
      document.getElementById("score").innerText = score;
      console.log(score);
      if (index === FRUITS.length - 1) {
        return;
      }
      World.remove(world, [collision.bodyA, collision.bodyB]);
      const newFruit = FRUITS[index + 1];
      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `public/${newFruit.name}.png` }
          },
          index: index + 1
        }
      );
      World.add(world, newBody);
      if (
        !disableAction &&
        (collision.bodyA.name === "topLine" ||
          collision.bodyB.name === "topLine")
      ) {
        alert("GameOver");
      }
    }
  });
});
addFruit();
