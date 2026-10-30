import { prisma } from '../config/db';
import { ProductService } from './product.service';

export class CartService {
  private static cleanPhone(phone?: string): string {
    return String(phone || '').replace(/[^0-9]/g, '');
  }

  public static async getCart(phoneNumber: string) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    if (!cleanPhone) {
      return [];
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { phoneNumber: cleanPhone },
      include: {
        vendor: true,
        product: {
          include: { category: true, vendor: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return cartItems
      .filter(item => item.product !== null)
      .map(item => {
        const itemPrice = item.price > 0 ? item.price : item.product.price;
        const subtotal = Number((itemPrice * item.quantity).toFixed(2));
        const effectiveVendor = item.vendor || item.product.vendor;
        const vendorId = item.vendorId || item.product.vendorId || effectiveVendor?.id || null;
        const vendorName = effectiveVendor?.businessName || item.product.brand || 'Organic Partner';

        return {
          id: item.id,
          qty: item.quantity,
          unit: item.unit || item.product.unit || 'Kg',
          price: itemPrice,
          subtotal,
          customerId: item.userId,
          vendorId,
          vendorName,
          vendor: effectiveVendor ? {
            id: effectiveVendor.id,
            businessName: effectiveVendor.businessName,
            ownerName: effectiveVendor.ownerName,
            phoneNumber: effectiveVendor.phoneNumber,
            address: effectiveVendor.address,
            rating: effectiveVendor.rating || 4.8
          } : null,
          product: ProductService.formatProduct(item.product)
        };
      });
  }

  public static async getCartGroupedByVendor(phoneNumber: string) {
    const items = await this.getCart(phoneNumber);
    const groupsMap = new Map<string, any>();

    for (const it of items) {
      const vId = it.vendorId || 'unassigned';
      if (!groupsMap.has(vId)) {
        groupsMap.set(vId, {
          vendorId: vId,
          vendorName: it.vendorName,
          vendor: it.vendor,
          items: [],
          subtotal: 0,
          totalItems: 0
        });
      }
      const grp = groupsMap.get(vId);
      grp.items.push(it);
      grp.subtotal = Number((grp.subtotal + it.subtotal).toFixed(2));
      grp.totalItems += it.qty;
    }

    return Array.from(groupsMap.values());
  }

  public static async addToCart(phoneNumber: string, productId: string, qty = 1, unit?: string, price?: number) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    if (!cleanPhone) {
      throw new Error('Phone number is required to add items to cart.');
    }
    if (!productId) {
      throw new Error('Product ID is required.');
    }
    const quantity = Math.max(1, Number(qty) || 1);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { vendor: true }
    });
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found.`);
    }

    const effectiveVendorId = product.vendorId || product.vendor?.id || null;
    const effectiveUnit = unit || product.unit || 'Kg';
    const effectivePrice = price !== undefined && Number(price) > 0 ? Number(price) : product.price;

    // Try finding user to associate if exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    await prisma.cartItem.upsert({
      where: {
        phoneNumber_productId: {
          phoneNumber: cleanPhone,
          productId
        }
      },
      update: {
        quantity: { increment: quantity },
        userId: user ? user.id : undefined,
        vendorId: effectiveVendorId,
        unit: effectiveUnit,
        price: effectivePrice
      },
      create: {
        phoneNumber: cleanPhone,
        productId,
        quantity,
        userId: user ? user.id : null,
        vendorId: effectiveVendorId,
        unit: effectiveUnit,
        price: effectivePrice
      }
    });

    return this.getCart(cleanPhone);
  }

  public static async updateQty(phoneNumber: string, productId: string, delta?: number, newQty?: number) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    if (!cleanPhone) {
      throw new Error('Phone number is required.');
    }
    if (!productId) {
      throw new Error('Product ID is required.');
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        phoneNumber_productId: {
          phoneNumber: cleanPhone,
          productId
        }
      }
    });

    let targetQty = 1;
    if (newQty !== undefined) {
      targetQty = Number(newQty);
    } else if (delta !== undefined && existing) {
      targetQty = existing.quantity + Number(delta);
    } else if (delta !== undefined) {
      targetQty = Math.max(1, Number(delta));
    }

    if (targetQty <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          phoneNumber: cleanPhone,
          productId
        }
      });
    } else {
      const user = await prisma.user.findUnique({
        where: { phoneNumber: cleanPhone }
      });

      await prisma.cartItem.updateMany({
        where: {
          phoneNumber: cleanPhone,
          productId
        },
        data: {
          quantity: targetQty,
          userId: user ? user.id : undefined
        }
      });
    }

    return this.getCart(cleanPhone);
  }

  public static async removeItem(phoneNumber: string, productId: string) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    if (!cleanPhone) {
      throw new Error('Phone number is required.');
    }

    await prisma.cartItem.deleteMany({
      where: {
        phoneNumber: cleanPhone,
        productId
      }
    });

    return this.getCart(cleanPhone);
  }

  public static async clearCart(phoneNumber: string) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    if (!cleanPhone) {
      return { count: 0 };
    }

    const result = await prisma.cartItem.deleteMany({
      where: { phoneNumber: cleanPhone }
    });

    return { count: result.count };
  }

  public static async syncCart(phoneNumber: string, items: { productId: string; qty: number }[]) {
    const cleanPhone = this.cleanPhone(phoneNumber);
    if (!cleanPhone) {
      throw new Error('Phone number is required to sync cart.');
    }

    if (Array.isArray(items) && items.length > 0) {
      const user = await prisma.user.findUnique({
        where: { phoneNumber: cleanPhone }
      });

      for (const item of items) {
        if (!item || !item.productId) continue;
        const qty = Math.max(1, Number(item.qty) || 1);

        const prod = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (!prod) continue;

        const existing = await prisma.cartItem.findUnique({
          where: {
            phoneNumber_productId: {
              phoneNumber: cleanPhone,
              productId: item.productId
            }
          }
        });

        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: {
              quantity: Math.max(existing.quantity, qty),
              userId: user ? user.id : undefined
            }
          });
        } else {
          await prisma.cartItem.create({
            data: {
              phoneNumber: cleanPhone,
              productId: item.productId,
              quantity: qty,
              userId: user ? user.id : null
            }
          });
        }
      }
    }

    return this.getCart(cleanPhone);
  }
}
