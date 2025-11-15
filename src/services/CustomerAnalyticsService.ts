import { Logger } from '@sandip1046/rubizz-shared-libs';
import { CustomerModel } from '../models/Customer';
import RedisService from './RedisService';
import { CustomerLoyaltyPoint } from '../schemas/CustomerSchema';

export interface CustomerAnalytics {
  customerId: string;
  totalSpent: number;
  totalOrders: number;
  totalBookings: number;
  averageOrderValue: number;
  averageBookingValue: number;
  loyaltyPoints: number;
  loyaltyPointsRedeemed: number;
  lastOrderDate?: Date;
  lastBookingDate?: Date;
  favoriteCategories: string[];
  engagementScore: number;
  lifetimeValue: number;
  churnRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  segment: 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerEngagementMetrics {
  customerId: string;
  loginFrequency: number;
  orderFrequency: number;
  bookingFrequency: number;
  supportTicketCount: number;
  reviewCount: number;
  referralCount: number;
  lastActivityDate: Date;
  engagementScore: number;
}

export interface CustomerSpendingPattern {
  customerId: string;
  monthlySpending: Array<{ month: string; amount: number }>;
  categorySpending: Array<{ category: string; amount: number }>;
  averageMonthlySpending: number;
  spendingTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  peakSpendingMonth: string;
}

export class CustomerAnalyticsService {
  private customerModel: CustomerModel;
  private redisService: RedisService;
  private logger: Logger;

  constructor() {
    this.customerModel = new CustomerModel();
    this.redisService = new RedisService();
    this.logger = Logger.getInstance('rubizz-customer-service', process.env['NODE_ENV'] || 'development');
  }

  /**
   * Get comprehensive analytics for a customer
   */
  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics> {
    try {
      // Try cache first
      const cacheKey = `customer:analytics:${customerId}`;
      const cached = await this.redisService.getCache<CustomerAnalytics>(cacheKey);
      if (cached) {
        return cached;
      }

      const customer = await this.customerModel.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get loyalty points
      const loyaltyPoints = await this.getCustomerLoyaltyPoints(customerId);
      
      // Calculate metrics
      const totalSpent = customer.profile?.totalSpent || 0;
      const totalOrders = customer.profile?.totalOrders || 0;
      const totalBookings = customer.profile?.totalBookings || 0;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const averageBookingValue = totalBookings > 0 ? totalSpent / totalBookings : 0;

      // Calculate engagement score
      const engagementScore = await this.calculateEngagementScore(customerId);

      // Determine segment
      const segment = this.determineCustomerSegment(totalSpent, totalOrders, engagementScore);

      // Determine churn risk
      const churnRisk = await this.calculateChurnRisk(customerId, engagementScore);

      // Calculate lifetime value
      const lifetimeValue = this.calculateLifetimeValue(totalSpent, engagementScore, loyaltyPoints.total);

      const analytics: CustomerAnalytics = {
        customerId,
        totalSpent,
        totalOrders,
        totalBookings,
        averageOrderValue,
        averageBookingValue,
        loyaltyPoints: loyaltyPoints.total,
        loyaltyPointsRedeemed: loyaltyPoints.redeemed,
        lastOrderDate: customer.profile?.lastOrderDate,
        lastBookingDate: customer.profile?.lastBookingDate,
        favoriteCategories: customer.profile?.favoriteItems || [],
        engagementScore,
        lifetimeValue,
        churnRisk,
        segment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Cache for 1 hour
      await this.redisService.setCache(cacheKey, analytics, 3600);

      return analytics;
    } catch (error) {
      this.logger.error('Failed to get customer analytics:', error as Error);
      throw error;
    }
  }

  /**
   * Get customer engagement metrics
   */
  async getCustomerEngagementMetrics(customerId: string): Promise<CustomerEngagementMetrics> {
    try {
      const cacheKey = `customer:engagement:${customerId}`;
      const cached = await this.redisService.getCache<CustomerEngagementMetrics>(cacheKey);
      if (cached) {
        return cached;
      }

      const customer = await this.customerModel.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get activity data (this would typically come from activity logs)
      const loginFrequency = await this.getActivityFrequency(customerId, 'LOGIN');
      const orderFrequency = customer.profile?.totalOrders || 0;
      const bookingFrequency = customer.profile?.totalBookings || 0;
      
      // These would come from other services
      const supportTicketCount = 0; // TODO: Integrate with support service
      const reviewCount = 0; // TODO: Integrate with review service
      const referralCount = 0; // TODO: Track referrals

      const lastActivityDate = customer.lastLoginAt || customer.createdAt || new Date();
      const engagementScore = await this.calculateEngagementScore(customerId);

      const metrics: CustomerEngagementMetrics = {
        customerId,
        loginFrequency,
        orderFrequency,
        bookingFrequency,
        supportTicketCount,
        reviewCount,
        referralCount,
        lastActivityDate,
        engagementScore,
      };

      // Cache for 30 minutes
      await this.redisService.setCache(cacheKey, metrics, 1800);

      return metrics;
    } catch (error) {
      this.logger.error('Failed to get customer engagement metrics:', error as Error);
      throw error;
    }
  }

  /**
   * Get customer spending patterns
   */
  async getCustomerSpendingPattern(customerId: string, months: number = 12): Promise<CustomerSpendingPattern> {
    try {
      const cacheKey = `customer:spending:${customerId}:${months}`;
      const cached = await this.redisService.getCache<CustomerSpendingPattern>(cacheKey);
      if (cached) {
        return cached;
      }

      // This would typically query order/booking data
      // For now, we'll use placeholder data structure
      const monthlySpending: Array<{ month: string; amount: number }> = [];
      const categorySpending: Array<{ category: string; amount: number }> = [];

      // Calculate average
      const totalAmount = monthlySpending.reduce((sum, item) => sum + item.amount, 0);
      const averageMonthlySpending = monthlySpending.length > 0 ? totalAmount / monthlySpending.length : 0;

      // Determine trend
      const spendingTrend = this.calculateSpendingTrend(monthlySpending);

      // Find peak month
      const peakSpendingMonth = monthlySpending.length > 0
        ? monthlySpending.reduce((max, item) => item.amount > max.amount ? item : max, monthlySpending[0]).month
        : '';

      const pattern: CustomerSpendingPattern = {
        customerId,
        monthlySpending,
        categorySpending,
        averageMonthlySpending,
        spendingTrend,
        peakSpendingMonth,
      };

      // Cache for 1 hour
      await this.redisService.setCache(cacheKey, pattern, 3600);

      return pattern;
    } catch (error) {
      this.logger.error('Failed to get customer spending pattern:', error as Error);
      throw error;
    }
  }

  /**
   * Get analytics for multiple customers (bulk)
   */
  async getBulkCustomerAnalytics(customerIds: string[]): Promise<Map<string, CustomerAnalytics>> {
    const results = new Map<string, CustomerAnalytics>();
    
    await Promise.all(
      customerIds.map(async (customerId) => {
        try {
          const analytics = await this.getCustomerAnalytics(customerId);
          results.set(customerId, analytics);
        } catch (error) {
          this.logger.error(`Failed to get analytics for customer ${customerId}:`, error as Error);
        }
      })
    );

    return results;
  }

  /**
   * Get segment distribution
   */
  async getSegmentDistribution(): Promise<{
    VIP: number;
    REGULAR: number;
    NEW: number;
    INACTIVE: number;
  }> {
    try {
      // This would typically query all customers and aggregate
      // For now, return placeholder structure
      return {
        VIP: 0,
        REGULAR: 0,
        NEW: 0,
        INACTIVE: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get segment distribution:', error as Error);
      throw error;
    }
  }

  /**
   * Get top customers by spending
   */
  async getTopCustomersBySpending(limit: number = 10): Promise<CustomerAnalytics[]> {
    try {
      // This would typically query and sort by totalSpent
      // For now, return empty array
      return [];
    } catch (error) {
      this.logger.error('Failed to get top customers:', error as Error);
      throw error;
    }
  }

  /**
   * Calculate engagement score (0-100)
   */
  private async calculateEngagementScore(customerId: string): Promise<number> {
    try {
      const customer = await this.customerModel.getCustomerById(customerId);
      if (!customer) return 0;

      let score = 0;

      // Login frequency (30 points max)
      const daysSinceLastLogin = customer.lastLoginAt
        ? Math.floor((Date.now() - customer.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      if (daysSinceLastLogin < 7) score += 30;
      else if (daysSinceLastLogin < 30) score += 20;
      else if (daysSinceLastLogin < 90) score += 10;

      // Order frequency (30 points max)
      const totalOrders = customer.profile?.totalOrders || 0;
      if (totalOrders > 20) score += 30;
      else if (totalOrders > 10) score += 20;
      else if (totalOrders > 5) score += 10;
      else if (totalOrders > 0) score += 5;

      // Booking frequency (20 points max)
      const totalBookings = customer.profile?.totalBookings || 0;
      if (totalBookings > 10) score += 20;
      else if (totalBookings > 5) score += 15;
      else if (totalBookings > 0) score += 10;

      // Loyalty points (20 points max)
      const loyaltyPoints = await this.getCustomerLoyaltyPoints(customerId);
      if (loyaltyPoints.total > 1000) score += 20;
      else if (loyaltyPoints.total > 500) score += 15;
      else if (loyaltyPoints.total > 100) score += 10;
      else if (loyaltyPoints.total > 0) score += 5;

      return Math.min(100, score);
    } catch (error) {
      this.logger.error('Failed to calculate engagement score:', error as Error);
      return 0;
    }
  }

  /**
   * Calculate churn risk
   */
  private async calculateChurnRisk(customerId: string, engagementScore: number): Promise<'LOW' | 'MEDIUM' | 'HIGH'> {
    try {
      const customer = await this.customerModel.getCustomerById(customerId);
      if (!customer) return 'HIGH';

      const daysSinceLastLogin = customer.lastLoginAt
        ? Math.floor((Date.now() - customer.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceLastLogin > 90 || engagementScore < 20) return 'HIGH';
      if (daysSinceLastLogin > 30 || engagementScore < 50) return 'MEDIUM';
      return 'LOW';
    } catch (error) {
      this.logger.error('Failed to calculate churn risk:', error as Error);
      return 'MEDIUM';
    }
  }

  /**
   * Determine customer segment
   */
  private determineCustomerSegment(
    totalSpent: number,
    totalOrders: number,
    engagementScore: number
  ): 'VIP' | 'REGULAR' | 'NEW' | 'INACTIVE' {
    if (totalSpent > 10000 && totalOrders > 20 && engagementScore > 70) return 'VIP';
    if (totalSpent > 0 && totalOrders > 0 && engagementScore > 30) return 'REGULAR';
    if (totalOrders === 0 && totalSpent === 0) return 'NEW';
    return 'INACTIVE';
  }

  /**
   * Calculate lifetime value
   */
  private calculateLifetimeValue(
    totalSpent: number,
    engagementScore: number,
    loyaltyPoints: number
  ): number {
    // Base value: total spent
    let ltv = totalSpent;

    // Add engagement multiplier
    ltv += (engagementScore / 100) * totalSpent * 0.1;

    // Add loyalty points value (assuming 1 point = $0.01)
    ltv += loyaltyPoints * 0.01;

    return Math.round(ltv * 100) / 100;
  }

  /**
   * Calculate spending trend
   */
  private calculateSpendingTrend(
    monthlySpending: Array<{ month: string; amount: number }>
  ): 'INCREASING' | 'DECREASING' | 'STABLE' {
    if (monthlySpending.length < 2) return 'STABLE';

    const recent = monthlySpending.slice(-3);
    const older = monthlySpending.slice(0, -3);

    const recentAvg = recent.reduce((sum, item) => sum + item.amount, 0) / recent.length;
    const olderAvg = older.length > 0
      ? older.reduce((sum, item) => sum + item.amount, 0) / older.length
      : recentAvg;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 10) return 'INCREASING';
    if (change < -10) return 'DECREASING';
    return 'STABLE';
  }

  /**
   * Get customer loyalty points
   */
  private async getCustomerLoyaltyPoints(customerId: string): Promise<{
    total: number;
    redeemed: number;
  }> {
    try {
      const points = await CustomerLoyaltyPoint.aggregate([
        { $match: { customerId } },
        {
          $group: {
            _id: null,
            total: { $sum: { $cond: [{ $eq: ['$type', 'EARNED'] }, '$points', { $multiply: ['$points', -1] }] } },
            redeemed: { $sum: { $cond: [{ $eq: ['$type', 'REDEEMED'] }, '$points', 0] } },
          },
        },
      ]);

      if (points.length === 0) {
        return { total: 0, redeemed: 0 };
      }

      return {
        total: points[0].total || 0,
        redeemed: points[0].redeemed || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get customer loyalty points:', error as Error);
      return { total: 0, redeemed: 0 };
    }
  }

  /**
   * Get activity frequency
   */
  private async getActivityFrequency(customerId: string, activityType: string): Promise<number> {
    // This would typically query activity logs
    // For now, return placeholder
    return 0;
  }
}

export default CustomerAnalyticsService;

