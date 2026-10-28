import axiosInstance from '@/lib/axios';
import type {
    ReturnRequest,
    ReturnRequestListResponse,
} from '@/types/gen/shared/shared/returns/return';
import type { ReturnRequestPayload, ReturnRequestResponse } from '@/types/returnRequest';

/**
 * Map frontend return reason to backend string value
 * Backend uses: wrong_product, defective, damaged, poor_quality, other
 */
const mapReturnReason = (reason: string): string => {
    const map: Record<string, string> = {
        wrongItem: 'wrong_product',
        defective: 'defective',
        notAsDescribed: 'damaged',
        notSatisfied: 'poor_quality',
        other: 'other',
    };
    return map[reason] ?? 'other';
};

/**
 * Map frontend exchange reason to backend string value
 * Backend uses: wrong_size, wrong_color, defective, other
 */
const mapExchangeReason = (reason: string): string => {
    const map: Record<string, string> = {
        size: 'wrong_size',
        color: 'wrong_color',
        model: 'defective',
        other: 'other',
    };
    return map[reason] ?? 'other';
};

/**
 * Return Request Repository
 * Handles API calls for return/exchange requests using proto-generated types
 */
class ReturnRequestRepository {
    /**
     * Submit a return/exchange request
     */
    async submitReturnRequest(
        payload: ReturnRequestPayload
    ): Promise<ReturnRequestResponse> {
        // Map frontend payload to backend CreateReturnRequestDto
        // Backend expects string values: 'return'/'exchange' for type
        // and 'wrong_product', 'defective', etc. for reasons
        const backendPayload = {
            orderNumber: payload.orderId, // orderId is actually orderNumber from frontend
            requestType: payload.requestType === 'return' ? 'return' : 'exchange',
            returnReasons: (payload.returnReasons || []).map(mapReturnReason),
            exchangeReasons: (payload.exchangeReasons || []).map(mapExchangeReason),
            otherReason: payload.otherReason,
            imageIds: (payload.images || []).map((img) => img.id),
            bankInfo: payload.bankInfo,
        };

        const response = await axiosInstance.post<ReturnRequest>(
            '/shop/return-requests',
            backendPayload
        );

        return {
            success: true,
            message: 'Yêu cầu đổi trả đã được gửi thành công!',
            requestId: response.data.id,
        };
    }

    /**
     * Get user's return requests
     */
    async getMyReturnRequests(
        page = 1,
        limit = 10
    ): Promise<ReturnRequestListResponse> {
        const response = await axiosInstance.get<ReturnRequestListResponse>(
            '/shop/return-requests',
            {
                params: { page, limit },
            }
        );
        return response.data;
    }
}

export const returnRequestRepository = new ReturnRequestRepository();
