import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding OBOY YANKEE ENTERPRISE...');

  // 1. Create Company
  const company = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'OBOY YANKEE Demo Company',
      email: 'demo@oboyyankee.gh',
      phone: '+233 30 000 0000',
      address: 'Accra, Ghana',
      city: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      currency: 'GHS',
      currencySymbol: '₵',
      timezone: 'Africa/Accra',
      businessType: 'Retail',
    },
  });

  // 2. Create Default Branch (Main Shop)
  const mainBranch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'SHOP-01' } },
    update: {},
    create: {
      name: 'Main Shop',
      code: 'SHOP-01',
      phone: '+233 30 000 0000',
      address: 'Accra, Ghana',
      city: 'Accra',
      region: 'Greater Accra',
      managerName: 'Business Owner',
      isActive: true,
      companyId: company.id,
    },
  });

  // 3. Create System Roles
  const roles = [
    { name: 'Super Admin', slug: 'super_admin', description: 'Hidden system administrator for installation, license management, and emergency access', isSystem: true },
    { name: 'Company Admin', slug: 'company_admin', description: 'Full access to all company modules and settings', isSystem: true },
    { name: 'Manager', slug: 'manager', description: 'Manage operations, inventory, staff, and view reports', isSystem: true },
    { name: 'Cashier', slug: 'cashier', description: 'Process sales at the POS', isSystem: true },
    { name: 'Store Keeper', slug: 'store_keeper', description: 'Manage inventory and stock movements', isSystem: true },
    { name: 'Sales Officer', slug: 'sales_officer', description: 'Process sales and manage customer relationships', isSystem: true },
    { name: 'Accountant', slug: 'accountant', description: 'Manage expenses, accounting, and financial reports', isSystem: true },
    { name: 'HR', slug: 'hr', description: 'Manage employees, attendance, and payroll', isSystem: true },
    { name: 'Receptionist', slug: 'receptionist', description: 'Front desk operations and customer management', isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: {},
      create: role,
    });
  }

  // 3. Create Permissions
  const permissions = [
    { name: 'View Dashboard', slug: 'view_dashboard', module: 'dashboard' },
    { name: 'Process Sales', slug: 'process_sales', module: 'pos' },
    { name: 'Manage Products', slug: 'manage_products', module: 'inventory' },
    { name: 'View Inventory', slug: 'view_inventory', module: 'inventory' },
    { name: 'Manage Suppliers', slug: 'manage_suppliers', module: 'suppliers' },
    { name: 'Manage Customers', slug: 'manage_customers', module: 'customers' },
    { name: 'View Sales', slug: 'view_sales', module: 'sales' },
    { name: 'Manage Returns', slug: 'manage_returns', module: 'returns' },
    { name: 'Manage Expenses', slug: 'manage_expenses', module: 'expenses' },
    { name: 'View Accounting', slug: 'view_accounting', module: 'accounting' },
    { name: 'Manage Cash Drawers', slug: 'manage_cash_drawers', module: 'cash' },
    { name: 'Manage Employees', slug: 'manage_employees', module: 'hr' },
    { name: 'Manage Attendance', slug: 'manage_attendance', module: 'hr' },
    { name: 'View Reports', slug: 'view_reports', module: 'reports' },
    { name: 'Manage Users', slug: 'manage_users', module: 'settings' },
    { name: 'Manage Roles', slug: 'manage_roles', module: 'settings' },
    { name: 'Manage Settings', slug: 'manage_settings', module: 'settings' },
    { name: 'View Audit Logs', slug: 'view_audit_logs', module: 'audit' },
    { name: 'Manage Backups', slug: 'manage_backups', module: 'backup' },
    { name: 'Use AI Assistant', slug: 'use_ai', module: 'ai' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {},
      create: perm,
    });
  }

  // 4. Assign all permissions to super_admin and company_admin
  const adminRoles = await prisma.role.findMany({
    where: { slug: { in: ['super_admin', 'company_admin'] } },
  });
  const allPerms = await prisma.permission.findMany();

  for (const role of adminRoles) {
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // 5. Create hidden Super Admin user
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@oboyyankee.gh';
  const superAdminPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'NexaAdmin@2026!', 12);
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      passwordHash: superAdminPassword,
      fullName: 'System Administrator',
      role: 'super_admin',
      status: 'active',
      companyId: company.id,
      branchId: mainBranch.id,
    },
  });

  // 6. Create demo Company Admin user
  const companyAdminEmail = process.env.COMPANY_ADMIN_EMAIL || 'owner@oboyyankee.gh';
  const companyAdminPassword = await bcrypt.hash(process.env.COMPANY_ADMIN_PASSWORD || 'Admin@2026!', 12);
  await prisma.user.upsert({
    where: { email: companyAdminEmail },
    update: {},
    create: {
      email: companyAdminEmail,
      passwordHash: companyAdminPassword,
      fullName: 'Business Owner',
      role: 'company_admin',
      status: 'active',
      companyId: company.id,
      branchId: mainBranch.id,
    },
  });

  // 7. Create default payment methods
  const paymentMethods = [
    { name: 'Cash', type: 'cash', provider: null },
    { name: 'MTN MoMo', type: 'mobile_money', provider: 'mtn' },
    { name: 'Telecel Cash', type: 'mobile_money', provider: 'telecel' },
    { name: 'AT Money', type: 'mobile_money', provider: 'airteltigo' },
    { name: 'Card', type: 'card', provider: null },
    { name: 'Bank Transfer', type: 'bank', provider: null },
  ];

  for (const pm of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { companyId: company.id, name: pm.name },
    });
    if (!existing) {
      await prisma.paymentMethod.create({
        data: { ...pm, companyId: company.id },
      });
    }
  }

  // 8. Create default expense categories
  const expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Transport', 'Marketing', 'Supplies', 'Maintenance', 'Miscellaneous'];
  for (const cat of expenseCategories) {
    const existing = await prisma.expenseCategory.findFirst({
      where: { companyId: company.id, name: cat },
    });
    if (!existing) {
      await prisma.expenseCategory.create({
        data: { name: cat, companyId: company.id },
      });
    }
  }

  // 9. Create default settings
  const defaultSettings = [
    { key: 'receipt_footer', value: 'Thank you for shopping with us!', category: 'receipt', isPublic: true },
    { key: 'receipt_header', value: 'OBOY YANKEE ENTERPRISE', category: 'receipt', isPublic: true },
    { key: 'tax_enabled', value: 'false', category: 'tax', isPublic: true },
    { key: 'tax_rate', value: '0', category: 'tax', isPublic: true },
    { key: 'currency', value: 'GHS', category: 'general', isPublic: true },
    { key: 'low_stock_alerts', value: 'true', category: 'inventory', isPublic: true },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { companyId_key: { companyId: company.id, key: setting.key } },
      update: {},
      create: { ...setting, companyId: company.id },
    });
  }

  // 10. Create license
  const licenseKey = `NEXA-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
  await prisma.license.upsert({
    where: { licenseKey },
    update: {},
    create: {
      licenseKey,
      productName: 'OBOY YANKEE ENTERPRISE',
      edition: 'enterprise',
      maxUsers: 50,
      isActive: true,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   Branch: ${mainBranch.name} (${mainBranch.code})`);
  console.log(`   Super Admin: ${process.env.SUPER_ADMIN_EMAIL || 'admin@oboyyankee.gh'} / ***`);
  console.log(`   Company Admin: ${process.env.COMPANY_ADMIN_EMAIL || 'owner@oboyyankee.gh'} / ***`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
