import { Skeleton } from 'primereact/skeleton';

export default function DashboardSkeleton() {
    return (
        <div className="grid">
            <div className="col-12 lg:col-6">
                <Skeleton height="400px" borderRadius='0.75rem' className="mb-2"></Skeleton>
            </div>

            <div className="col-12 lg:col-6">
                <Skeleton height="400px" borderRadius='0.75rem' className="mb-2"></Skeleton>
            </div>
        </div>
    )
}