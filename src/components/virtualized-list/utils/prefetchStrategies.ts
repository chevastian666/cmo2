/**
 * Intelligent prefetch strategies based on scroll patterns
 */

interface ScrollEvent {
  scrollTop: number;
  timestamp: number;
  velocity: number;
  direction: 'up' | 'down' | null;
}

export class ScrollPredictor {
  private scrollHistory: ScrollEvent[] = [];
  private maxHistorySize: number = 50;
  private patterns: Map<string, number> = new Map();
  
  // Prediction parameters
  private readonly velocityThreshold = 100; // px/s
  private readonly accelerationThreshold = 50; // px/s²
  private readonly patternConfidenceThreshold = 0.7;

  /**
   * Analyze scroll pattern and update predictions
   */
  analyzeScrollPattern(scrollTop: number, timestamp: number): void {
    const lastEvent = this.scrollHistory[this.scrollHistory.length - 1];
    
    if (!lastEvent) {
      this.scrollHistory.push({
        scrollTop,
        timestamp,
        velocity: 0,
        direction: null
      });
      return;
    }

    const deltaTime = timestamp - lastEvent.timestamp;
    const deltaScroll = scrollTop - lastEvent.scrollTop;
    const velocity = deltaTime > 0 ? (deltaScroll / deltaTime) * 1000 : 0;
    const direction = deltaScroll > 0 ? 'down' : deltaScroll < 0 ? 'up' : null;

    this.scrollHistory.push({
      scrollTop,
      timestamp,
      velocity,
      direction
    });

    // Keep history size in check
    if (this.scrollHistory.length > this.maxHistorySize) {
      this.scrollHistory.shift();
    }

    // Update patterns
    this.updatePatterns();
  }

  /**
   * Predict next items based on current position and patterns
   */
  predictNextItems(currentIndex: number, visibleCount: number): number[] {
    const pattern = this.detectPattern();
    const velocity = this.getCurrentVelocity();
    const acceleration = this.getCurrentAcceleration();
    
    const predictedItems: number[] = [];
    
    if (pattern === 'fast-scroll-down') {
      // User is scrolling down quickly - prefetch more items ahead
      const prefetchCount = Math.ceil(visibleCount * 3);
      for (let i = 1; i <= prefetchCount; i++) {
        predictedItems.push(currentIndex + visibleCount + i);
      }
    } else if (pattern === 'fast-scroll-up') {
      // User is scrolling up quickly - prefetch items above
      const prefetchCount = Math.ceil(visibleCount * 3);
      for (let i = 1; i <= prefetchCount; i++) {
        predictedItems.push(currentIndex - i);
      }
    } else if (pattern === 'steady-browse') {
      // User is browsing steadily - prefetch moderate amount in scroll direction
      const direction = this.getScrollDirection();
      const prefetchCount = Math.ceil(visibleCount * 1.5);
      
      if (direction === 'down') {
        for (let i = 1; i <= prefetchCount; i++) {
          predictedItems.push(currentIndex + visibleCount + i);
        }
      } else if (direction === 'up') {
        for (let i = 1; i <= prefetchCount; i++) {
          predictedItems.push(currentIndex - i);
        }
      }
    } else if (pattern === 'jump-navigation') {
      // User is jumping between sections - prefetch common jump targets
      const jumpTargets = this.predictJumpTargets(currentIndex);
      predictedItems.push(...jumpTargets);
    }

    // Add velocity-based predictions
    if (Math.abs(velocity) > this.velocityThreshold) {
      const timeToReach = 2000; // Predict 2 seconds ahead
      const predictedDistance = velocity * timeToReach / 1000;
      const predictedIndex = currentIndex + Math.round(predictedDistance / 50); // Assuming ~50px per item
      
      for (let i = -5; i <= 5; i++) {
        predictedItems.push(predictedIndex + i);
      }
    }

    return [...new Set(predictedItems)].filter(i => i >= 0);
  }

  /**
   * Get prefetch range based on patterns
   */
  getPrefetchRange(visibleStart: number, visibleEnd: number): [number, number] {
    const pattern = this.detectPattern();
    const visibleCount = visibleEnd - visibleStart;
    
    switch (pattern) {
      case 'fast-scroll-down':
        return [visibleStart, visibleEnd + visibleCount * 3];
      
      case 'fast-scroll-up':
        return [Math.max(0, visibleStart - visibleCount * 3), visibleEnd];
      
      case 'steady-browse':
        const direction = this.getScrollDirection();
        if (direction === 'down') {
          return [visibleStart, visibleEnd + visibleCount];
        } else {
          return [Math.max(0, visibleStart - visibleCount), visibleEnd];
        }
      
      case 'jump-navigation':
        // Wider range for jump navigation
        return [
          Math.max(0, visibleStart - visibleCount * 2),
          visibleEnd + visibleCount * 2
        ];
      
      default:
        // Default conservative prefetch
        return [
          Math.max(0, visibleStart - Math.floor(visibleCount * 0.5)),
          visibleEnd + Math.floor(visibleCount * 0.5)
        ];
    }
  }

  /**
   * Detect scroll pattern
   */
  private detectPattern(): string {
    if (this.scrollHistory.length < 5) return 'unknown';

    const recentHistory = this.scrollHistory.slice(-10);
    const velocities = recentHistory.map(e => e.velocity);
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const directions = recentHistory.map(e => e.direction).filter(d => d !== null);
    
    // Check for consistent direction
    const downCount = directions.filter(d => d === 'down').length;
    const upCount = directions.filter(d => d === 'up').length;
    const directionConsistency = Math.max(downCount, upCount) / directions.length;

    // Detect patterns
    if (Math.abs(avgVelocity) > 500 && directionConsistency > 0.8) {
      return avgVelocity > 0 ? 'fast-scroll-down' : 'fast-scroll-up';
    }

    if (Math.abs(avgVelocity) > 50 && Math.abs(avgVelocity) < 200 && directionConsistency > 0.6) {
      return 'steady-browse';
    }

    // Check for jump pattern (large position changes)
    const positions = recentHistory.map(e => e.scrollTop);
    const jumps = positions.slice(1).map((pos, i) => Math.abs(pos - positions[i]));
    const avgJump = jumps.reduce((a, b) => a + b, 0) / jumps.length;
    
    if (avgJump > 1000) {
      return 'jump-navigation';
    }

    return 'normal';
  }

  /**
   * Update pattern recognition
   */
  private updatePatterns(): void {
    const pattern = this.detectPattern();
    const count = this.patterns.get(pattern) || 0;
    this.patterns.set(pattern, count + 1);
    
    // Decay old patterns
    this.patterns.forEach((count, key) => {
      if (key !== pattern) {
        this.patterns.set(key, count * 0.95);
      }
    });
  }

  /**
   * Get current scroll velocity
   */
  private getCurrentVelocity(): number {
    if (this.scrollHistory.length < 2) return 0;
    return this.scrollHistory[this.scrollHistory.length - 1].velocity;
  }

  /**
   * Get current acceleration
   */
  private getCurrentAcceleration(): number {
    if (this.scrollHistory.length < 3) return 0;
    
    const recent = this.scrollHistory.slice(-3);
    const v1 = recent[1].velocity;
    const v2 = recent[2].velocity;
    const deltaTime = recent[2].timestamp - recent[1].timestamp;
    
    return deltaTime > 0 ? ((v2 - v1) / deltaTime) * 1000 : 0;
  }

  /**
   * Get scroll direction
   */
  private getScrollDirection(): 'up' | 'down' | null {
    if (this.scrollHistory.length === 0) return null;
    return this.scrollHistory[this.scrollHistory.length - 1].direction;
  }

  /**
   * Predict jump targets based on history
   */
  private predictJumpTargets(currentIndex: number): number[] {
    // Implement logic to predict common jump targets
    // For now, return some common positions
    return [
      0, // Top
      Math.floor(currentIndex / 2), // Half way up
      currentIndex * 2, // Double current position
      currentIndex + 100, // 100 items ahead
      currentIndex + 1000 // 1000 items ahead
    ];
  }

  /**
   * Reset predictor state
   */
  reset(): void {
    this.scrollHistory = [];
    this.patterns.clear();
  }

  /**
   * Get prediction confidence
   */
  getConfidence(): number {
    if (this.scrollHistory.length < 10) return 0;
    
    const pattern = this.detectPattern();
    const patternCount = this.patterns.get(pattern) || 0;
    const totalCount = Array.from(this.patterns.values()).reduce((a, b) => a + b, 0);
    
    return totalCount > 0 ? patternCount / totalCount : 0;
  }
}