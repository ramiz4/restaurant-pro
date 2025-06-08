import { useState } from "react";

import {
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Receipt,
  Smartphone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, Payment } from "@/lib/mock-data";
import RestaurantService from "@/lib/restaurant-services";

interface PaymentDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (payment: Payment) => void;
}

export function PaymentDialog({
  order,
  isOpen,
  onClose,
  onPaymentComplete,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "mobile"
  >("cash");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  if (!order) return null;

  const subtotal = order.total;
  const tip = parseFloat(tipAmount) || 0;
  const total = subtotal + tip;
  const cashAmount = parseFloat(cashReceived) || 0;
  const change = paymentMethod === "cash" ? Math.max(0, cashAmount - total) : 0;

  const resetForm = () => {
    setPaymentMethod("cash");
    setTipAmount("");
    setCashReceived("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardholderName("");
    setProcessing(false);
    setCompleted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validatePayment = (): boolean => {
    if (tip < 0) return false;

    switch (paymentMethod) {
      case "cash":
        return cashAmount >= total;
      case "card":
        return (
          cardNumber.length >= 13 &&
          expiryDate.length >= 5 &&
          cvv.length >= 3 &&
          cardholderName.length > 0
        );
      case "mobile":
        return true; // Mobile payments are pre-validated
      default:
        return false;
    }
  };

  const processPayment = async () => {
    if (!validatePayment()) {
      alert("Please fill in all required payment information");
      return;
    }

    setProcessing(true);

    try {
      const paymentData = {
        orderId: order.id,
        amount: total,
        paymentMethod,
        status: "completed" as const,
        processedBy: "Current User", // In real app, get from auth context
        tip: tip || undefined,
        change: change || undefined,
        cardLast4: paymentMethod === "card" ? cardNumber.slice(-4) : undefined,
        transactionId:
          paymentMethod !== "cash" ? `TXN-${Date.now()}` : undefined,
      };

      const payment = await RestaurantService.processPayment(paymentData);

      setCompleted(true);

      // Show success for 2 seconds, then close
      setTimeout(() => {
        onPaymentComplete(payment);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment processing failed. Please try again.");
      setProcessing(false);
    }
  };

  const quickTipButtons = [0, 0.15, 0.18, 0.2, 0.25].map((percentage) => ({
    label: percentage === 0 ? "No Tip" : `${percentage * 100}%`,
    amount: percentage === 0 ? 0 : subtotal * percentage,
  }));

  if (completed) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[400px]">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-center text-muted-foreground mb-4">
              Payment of ${total.toFixed(2)} has been processed successfully.
            </p>
            <Badge variant="secondary" className="mb-4">
              Receipt #{String(Date.now()).slice(-6)}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Process Payment - {order.id}</span>
          </DialogTitle>
          <DialogDescription>
            Complete the payment for Table {order.tableNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.menuItem.name}
                  </span>
                  <span>
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tip Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {quickTipButtons.map((button) => (
                  <Button
                    key={button.label}
                    variant={
                      tipAmount === button.amount.toFixed(2)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setTipAmount(button.amount.toFixed(2))}
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="customTip">Custom amount:</Label>
                <Input
                  id="customTip"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="w-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="cash"
                    className="flex items-center space-x-1"
                  >
                    <Banknote className="h-4 w-4" />
                    <span>Cash</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="card"
                    className="flex items-center space-x-1"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Card</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="mobile"
                    className="flex items-center space-x-1"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cash" className="mt-4">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cashReceived">Cash Received</Label>
                      <Input
                        id="cashReceived"
                        type="number"
                        step="0.01"
                        min={total}
                        placeholder={total.toFixed(2)}
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                      />
                    </div>
                    {change > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          Change due: ${change.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="card" className="mt-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        placeholder="Full name on card"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 16),
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length >= 2) {
                              value =
                                value.slice(0, 2) + "/" + value.slice(2, 4);
                            }
                            setExpiryDate(value);
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 4),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mobile" className="mt-4">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Smartphone className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h4 className="font-medium mb-2">Mobile Payment Ready</h4>
                    <p className="text-sm text-muted-foreground">
                      Customer can pay using Apple Pay, Google Pay, or other
                      mobile payment apps.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Payment Total */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            onClick={processPayment}
            disabled={!validatePayment() || processing}
            className="min-w-[120px]"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${total.toFixed(2)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
