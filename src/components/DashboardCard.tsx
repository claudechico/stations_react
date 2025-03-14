interface DashboardCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  color: string;
  subtitle?: string;
}

const DashboardCard = ({ title, value, Icon, color, subtitle }: DashboardCardProps) => (
  <div className="bg-[#FFFAF0] rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} text-white`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
        {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
      </div>
    </div>
  </div>
); 