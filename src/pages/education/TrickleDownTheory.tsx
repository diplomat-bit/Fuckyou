import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

// Define a type for our custom body with a lifespan property
type MoneyBody = Matter.Body & {
  lifespan: number;
  initialLifespan: number;
};

const TrickleDownTheory: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const runnerRef = useRef(Matter.Runner.create());

  const [stats, setStats] = useState({
    poured: 0,
    evaporated: 0,
    reachedBottom: 0,
  });

  const [evaporationRate, setEvaporationRate] = useState(0.005); // Higher is faster
  const [pourAmount, setPourAmount] = useState(50);

  useEffect(() => {
    const engine = engineRef.current;
    const world = engine.world;
    engine.gravity.y = 0.8;

    const render = Matter.Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: '#1a202c', // Dark background
      },
    });

    // --- Create the world boundaries and obstacles ---

    const ground = Matter.Bodies.rectangle(400, 590, 810, 20, {
      isStatic: true,
      label: 'ground',
      render: { fillStyle: '#4a5568' },
    });

    const leftWall = Matter.Bodies.rectangle(0, 300, 20, 600, { isStatic: true, render: { visible: false } });
    const rightWall = Matter.Bodies.rectangle(800, 300, 20, 600, { isStatic: true, render: { visible: false } });

    // Funnel at the top
    const funnelLeft = Matter.Bodies.rectangle(350, 100, 200, 10, {
      isStatic: true,
      angle: Math.PI / 8,
      render: { fillStyle: '#a0aec0' },
    });
    const funnelRight = Matter.Bodies.rectangle(450, 100, 200, 10, {
      isStatic: true,
      angle: -Math.PI / 8,
      render: { fillStyle: '#a0aec0' },
    });

    // The "Economy" pyramid structure
    const pyramid = Matter.Composites.pyramid(150, 200, 9, 5, 0, 0, (x, y) => {
      return Matter.Bodies.rectangle(x, y, 50, 50, {
        isStatic: true,
        render: {
          fillStyle: '#718096',
          strokeStyle: '#4a5568',
          lineWidth: 2,
        },
      });
    });

    Matter.Composite.add(world, [ground, leftWall, rightWall, funnelLeft, funnelRight, pyramid]);

    // --- Simulation Logic ---

    const handleEvaporation = () => {
      const bodies = Matter.Composite.allBodies(world) as MoneyBody[];
      bodies.forEach(body => {
        if (body.label === 'money') {
          body.lifespan -= evaporationRate * 100; // Adjust for update interval

          // Visual feedback for evaporation
          const lifeRatio = Math.max(0, body.lifespan / body.initialLifespan);
          body.render.opacity = lifeRatio;
          Matter.Body.scale(body, lifeRatio, lifeRatio); // Shrink the body
          // Restore original radius for next scaling operation
          body.circleRadius = 5;


          if (body.lifespan <= 0) {
            Matter.World.remove(world, body);
            setStats(prev => ({ ...prev, evaporated: prev.evaporated + 1 }));
          }
        }
      });
    };

    Matter.Events.on(engine, 'beforeUpdate', handleEvaporation);

    const handleCollisions = (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if (bodyA.label === 'money' && bodyB.label === 'ground') {
          Matter.World.remove(world, bodyA);
          setStats(prev => ({ ...prev, reachedBottom: prev.reachedBottom + 1 }));
        } else if (bodyB.label === 'money' && bodyA.label === 'ground') {
          Matter.World.remove(world, bodyB);
          setStats(prev => ({ ...prev, reachedBottom: prev.reachedBottom + 1 }));
        }
      });
    };

    Matter.Events.on(engine, 'collisionStart', handleCollisions);

    // --- Run the simulation ---
    Matter.Render.run(render);
    const runner = runnerRef.current;
    Matter.Runner.run(runner, engine);

    // --- Cleanup ---
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
      Matter.Events.off(engine, 'beforeUpdate', handleEvaporation);
      Matter.Events.off(engine, 'collisionStart', handleCollisions);
    };
  }, [evaporationRate]); // Rerun effect if evaporationRate changes

  const handlePourMoney = () => {
    const world = engineRef.current.world;
    setStats(prev => ({ ...prev, poured: prev.poured + pourAmount }));

    for (let i = 0; i < pourAmount; i++) {
      const lifespan = 100 + Math.random() * 50; // Lifespan in ticks
      const body = Matter.Bodies.circle(
        390 + Math.random() * 20, // Spawn in the middle of the funnel
        20,
        5, // radius
        {
          label: 'money',
          restitution: 0.5,
          friction: 0.1,
          render: {
            fillStyle: '#48bb78', // Green for money
          },
        }
      ) as MoneyBody;

      body.lifespan = lifespan;
      body.initialLifespan = lifespan;

      Matter.World.add(world, body);
    }
  };

  const handleReset = () => {
    setStats({ poured: 0, evaporated: 0, reachedBottom: 0 });
    const world = engineRef.current.world;
    const bodies = Matter.Composite.allBodies(world);
    bodies.forEach(body => {
      if (body.label === 'money') {
        Matter.World.remove(world, body);
      }
    });
  };

  const efficiency = stats.poured > 0 ? (stats.reachedBottom / stats.poured) * 100 : 0;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>The "Trickle-Down" Effect: A Realistic Simulation</h1>
      <p style={styles.paragraph}>
        Witness the celebrated economic theory in action! We inject capital ("money") at the highest echelons of our economic structure.
        Observe as this wealth gracefully navigates the complex system. A certain amount may, through natural economic processes ("evaporation"),
        vanish into the ether, fueling innovation and... other things. The remainder is destined to enrich the foundation of our society.
      </p>
      <div style={styles.mainContent}>
        <div ref={sceneRef} style={styles.simulationCanvas} />
        <div style={styles.controlsAndStats}>
          <h2 style={styles.subHeader}>Economic Controls</h2>
          <div style={styles.controlGroup}>
            <button onClick={handlePourMoney} style={styles.button}>
              Inject Capital (Pour ${pourAmount})
            </button>
            <button onClick={handleReset} style={{...styles.button, ...styles.resetButton}}>
              Reset Economy
            </button>
          </div>
          <div style={styles.controlGroup}>
            <label htmlFor="pourAmount" style={styles.label}>Capital Injection Size: {pourAmount}</label>
            <input
              id="pourAmount"
              type="range"
              min="10"
              max="200"
              step="10"
              value={pourAmount}
              onChange={(e) => setPourAmount(Number(e.target.value))}
              style={styles.slider}
            />
          </div>
          <div style={styles.controlGroup}>
            <label htmlFor="evaporationRate" style={styles.label}>
              Economic Evaporation Rate: {Math.round(evaporationRate * 1000)}
            </label>
            <input
              id="evaporationRate"
              type="range"
              min="0.001"
              max="0.02"
              step="0.001"
              value={evaporationRate}
              onChange={(e) => setEvaporationRate(Number(e.target.value))}
              style={styles.slider}
            />
             <small style={styles.smallText}>Represents complex factors like offshore accounts, stock buybacks, and superyacht maintenance.</small>
          </div>
          <div style={styles.statsContainer}>
            <h2 style={styles.subHeader}>Economic Ledger</h2>
            <p style={styles.statItem}>
              Total Capital Injected: <span style={styles.statValue}>{stats.poured} units</span>
            </p>
            <p style={styles.statItem}>
              Capital Evaporated: <span style={styles.statValue}>{stats.evaporated} units</span>
            </p>
            <p style={styles.statItem}>
              Capital Reaching Foundation: <span style={styles.statValue}>{stats.reachedBottom} units</span>
            </p>
            <hr style={styles.hr} />
            <p style={styles.statItem} >
              <strong>Trickle-Down Efficiency:</strong> <span style={{...styles.statValue, color: '#e53e3e', fontSize: '1.5rem'}}>{efficiency.toFixed(2)}%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    fontFamily: 'sans-serif',
    color: '#e2e8f0',
    backgroundColor: '#2d3748',
    maxWidth: '1200px',
    margin: '0 auto',
    borderRadius: '8px',
  },
  header: {
    fontSize: '2.5rem',
    textAlign: 'center',
    color: '#90cdf4',
    marginBottom: '1rem',
    textShadow: '2px 2px 4px #000',
  },
  paragraph: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 2rem auto',
    color: '#a0aec0',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  simulationCanvas: {
    border: '2px solid #4a5568',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
  },
  controlsAndStats: {
    flex: 1,
    minWidth: '300px',
    maxWidth: '350px',
    backgroundColor: '#1a202c',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #4a5568',
  },
  subHeader: {
    fontSize: '1.8rem',
    color: '#63b3ed',
    borderBottom: '2px solid #4a5568',
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  controlGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#cbd5e0',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  smallText: {
    fontSize: '0.8rem',
    color: '#718096',
    display: 'block',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a202c',
    backgroundColor: '#68d391',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginBottom: '0.5rem',
  },
  resetButton: {
    backgroundColor: '#f56565',
  },
  statsContainer: {
    marginTop: '2rem',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    marginBottom: '0.75rem',
    color: '#cbd5e0',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#f7fafc',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #4a5568',
    margin: '1rem 0',
  },
};

export default TrickleDownTheory;