import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import './Stats.css';

interface Stat {
  id: number;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

const stats: Stat[] = [
  {
    id: 1,
    value: 100000,
    label: 'Lines of Code',
    suffix: '+',
  },
  {
    id: 2,
    value: 20,
    label: 'Projects Completed',
    suffix: '+',
  },
  {
    id: 3,
    value: 15,
    label: 'Technologies',
    suffix: '+',
  },
  {
    id: 4,
    value: 3,
    label: 'Years Experience',
    suffix: '+',
  },
];

const Stats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section className="stats" ref={ref}>
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className="stat-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="stat-value">
                {inView && (
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-glow"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface CountUpProps {
  start: number;
  end: number;
  duration: number;
  prefix?: string;
  suffix?: string;
}

const CountUp = ({ start, end, duration, prefix = '', suffix = '' }: CountUpProps) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);

      setCount(current);

      if (percentage < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  }, [start, end, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <span>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

export default Stats;
