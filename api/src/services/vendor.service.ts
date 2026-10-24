import { prisma } from '../config/db';

export class VendorService {
  public static async submitVendorRequest(payload: any) {
    const {
      userId,
      userName,
      phoneNumber,
      farmName,
      farmLocation,
      cropCategories,
      experienceYears,
      certificateNo,
      note
    } = payload;

    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      throw new Error('Valid 10-digit mobile number required.');
    }

    if (!farmName || !farmLocation) {
      throw new Error('Farm Name and Location are required.');
    }

    // Check if user is already an approved vendor
    const user = await prisma.user.findUnique({ where: { phoneNumber: cleanPhone } });
    if (user?.role === 'vendor' || user?.vendorStatus === 'APPROVED') {
      return {
        alreadyApproved: true,
        message: 'You are already an approved Partner Farmer / Vendor!',
        status: 'APPROVED'
      };
    }

    // Check existing pending request
    const existing = await prisma.vendorRequest.findFirst({
      where: { phoneNumber: cleanPhone, status: 'PENDING' }
    });
    if (existing) {
      return {
        alreadyPending: true,
        message: 'Your vendor registration is already under review by Admin.',
        data: existing,
        status: 'PENDING'
      };
    }

    const request = await prisma.vendorRequest.create({
      data: {
        userId: userId || undefined,
        userName: userName || user?.fullName || 'Farmer Partner',
        phoneNumber: cleanPhone,
        farmName: String(farmName).trim(),
        farmLocation: String(farmLocation).trim(),
        cropCategories: String(cropCategories || 'Fresh Vegetables & Dairy').trim(),
        experienceYears: String(experienceYears || '3').trim(),
        certificateNo: String(certificateNo || 'NPOP-ORG-TN-4821').trim(),
        status: 'PENDING',
        note: note ? String(note).trim() : null
      }
    });

    // Update User vendorStatus
    await prisma.user.upsert({
      where: { phoneNumber: cleanPhone },
      update: { vendorStatus: 'PENDING' },
      create: {
        fullName: userName || 'Farmer Partner',
        phoneNumber: cleanPhone,
        role: 'customer',
        vendorStatus: 'PENDING',
        passwordHash: 'OTP_VERIFIED',
        location: farmLocation
      }
    });

    console.log(`[Vendor Application]: New request submitted for +91 ${cleanPhone} (${farmName})`);

    return {
      message: 'Vendor application submitted! Awaiting admin approval.',
      data: request,
      status: 'PENDING'
    };
  }

  public static async getVendorRequests(status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status).toUpperCase();
    }
    return prisma.vendorRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async getVendorStatusByPhone(phoneNumber: string) {
    const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');
    const user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    const latestReq = await prisma.vendorRequest.findFirst({
      where: { phoneNumber: cleanPhone },
      orderBy: { createdAt: 'desc' }
    });

    const isApproved = user?.role === 'vendor' || latestReq?.status === 'APPROVED';
    const status = isApproved ? 'APPROVED' : (latestReq?.status || user?.vendorStatus || 'NONE');

    return {
      phoneNumber: cleanPhone,
      status, // NONE, PENDING, APPROVED, REJECTED
      isApproved,
      request: latestReq
    };
  }

  public static async approveVendorRequest(id: string) {
    const request = await prisma.vendorRequest.findUnique({ where: { id } });
    if (!request) {
      throw new Error('Vendor request not found.');
    }

    const updatedReq = await prisma.vendorRequest.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    await prisma.user.upsert({
      where: { phoneNumber: request.phoneNumber },
      update: { role: 'vendor', vendorStatus: 'APPROVED' },
      create: {
        fullName: request.userName,
        phoneNumber: request.phoneNumber,
        role: 'vendor',
        vendorStatus: 'APPROVED',
        passwordHash: 'OTP_VERIFIED',
        location: request.farmLocation
      }
    });

    console.log(`[Admin]: Approved vendor request ${id} for +91 ${request.phoneNumber} (${request.farmName})`);

    return {
      message: `Approved "${request.farmName}" as verified Vendor!`,
      data: updatedReq
    };
  }

  public static async rejectVendorRequest(id: string, reason?: string) {
    const updatedReq = await prisma.vendorRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        note: reason ? String(reason) : 'Incomplete farm documentation'
      }
    });

    await prisma.user.updateMany({
      where: { phoneNumber: updatedReq.phoneNumber },
      data: { vendorStatus: 'REJECTED' }
    });

    return {
      message: 'Vendor request rejected.',
      data: updatedReq
    };
  }
}
