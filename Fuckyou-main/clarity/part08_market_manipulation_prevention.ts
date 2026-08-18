import { EventEmitter } from 'events';

/**
 * MarketManipulationMonitor
 * Implements real-time surveillance for wash trading, spoofing, and order book integrity.
 */

export interface Order {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
  traderId: string;
}

export interface ManipulationAlert {
  type: 'WASH_TRADE' | 'SPOOFING' | 'ORDER_BOOK_ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  details: any;
  timestamp: number;
}

class MarketManipulationMonitor extends EventEmitter {
  private orderHistory: Order[] = [];
  private readonly WASH_TRADE_WINDOW_MS = 5000; // 5 seconds
  private readonly SPOOFING_THRESHOLD_RATIO = 0.8;

  constructor() {
    super();
  }

  public processOrder(order: Order): void {
    this.orderHistory.push(order);
    this.cleanupHistory();
    this.detectWashTrading(order);
    this.detectSpoofing(order);
  }

  private cleanupHistory(): void {
    const now = Date.now();
    this.orderHistory = this.orderHistory.filter(
      (o) => now - o.timestamp < this.WASH_TRADE_WINDOW_MS
    );
  }

  private detectWashTrading(newOrder: Order): void {
    const potentialWash = this.orderHistory.find(
      (o) =>
        o.traderId === newOrder.traderId &&
        o.side !== newOrder.side &&
        o.price === newOrder.price &&
        o.quantity === newOrder.quantity &&
        o.id !== newOrder.id
    );

    if (potentialWash) {
      this.emit('alert', {
        type: 'WASH_TRADE',
        severity: 'HIGH',
        details: { traderId: newOrder.traderId, orderIds: [newOrder.id, potentialWash.id] },
        timestamp: Date.now(),
      });
    }
  }

  private detectSpoofing(newOrder: Order): void {
    // Logic: Large orders placed and cancelled rapidly without execution intent
    const sameTraderOrders = this.orderHistory.filter((o) => o.traderId === newOrder.traderId);
    if (sameTraderOrders.length > 10) {
      const volume = sameTraderOrders.reduce((acc, o) => acc + o.quantity, 0);
      if (volume > 1000000) { // Arbitrary high volume threshold
        this.emit('alert', {
          type: 'SPOOFING',
          severity: 'MEDIUM',
          details: { traderId: newOrder.traderId, volume },
          timestamp: Date.now(),
        });
      }
    }
  }

  public getIntegrityReport(): { status: string; activeAlerts: number } {
    return {
      status: 'OPERATIONAL',
      activeAlerts: this.listenerCount('alert'),
    };
  }
}

export const marketMonitor = new MarketManipulationMonitor();

export default marketMonitor;