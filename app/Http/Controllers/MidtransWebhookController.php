<?php

namespace App\Http\Controllers;

use App\Mail\BookingConfirmed;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MidtransWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        // Verify Midtrans signature
        $expectedSig = hash(
            'sha512',
            ($payload['order_id'] ?? '') .
            ($payload['status_code'] ?? '') .
            ($payload['gross_amount'] ?? '') .
            config('midtrans.server_key')
        );

        if (($payload['signature_key'] ?? '') !== $expectedSig) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $orderId = $payload['order_id'] ?? '';
        if (!str_starts_with($orderId, 'PADELAH-')) {
            return response()->json(['message' => 'Unknown order'], 200);
        }

        $bookingId = (int) str_replace('PADELAH-', '', $orderId);
        $booking   = Booking::find($bookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        // Idempotency: skip if already confirmed or cancelled
        if ($booking->status === 'confirmed' || $booking->status === 'cancelled') {
            return response()->json(['message' => 'OK']);
        }

        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus       = $payload['fraud_status'] ?? null;
        $paymentType       = $payload['payment_type'] ?? null;

        if (
            ($transactionStatus === 'capture' && $fraudStatus === 'accept') ||
            $transactionStatus === 'settlement'
        ) {
            $this->confirmPayment($booking, $paymentType);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $booking->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);
        }
        // 'pending' — waiting for bank transfer settlement, no action yet

        return response()->json(['message' => 'OK']);
    }

    private function confirmPayment(Booking $booking, ?string $paymentMethod): void
    {
        $booking->update([
            'status'         => 'confirmed',
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod,
        ]);

        $booking->load(['venue', 'court', 'user']);

        try {
            Mail::to($booking->user->email)->send(new BookingConfirmed($booking));
        } catch (\Throwable $e) {
            // Non-fatal: booking already confirmed
        }
    }
}
