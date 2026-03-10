import { MapPin, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FacilityTag } from '@/components/padel/facility-tag';
import type { Venue } from '@/types/venue';
import { cn } from '@/lib/utils';

interface VenueCardProps {
    venue: Venue;
    onBookNow?: (venue: Venue) => void;
    onContactVenue?: (venue: Venue) => void;
    className?: string;
}

export function VenueCard({ venue, onBookNow, onContactVenue, className }: VenueCardProps) {
    return (
        <div
            className={cn(
                'group flex flex-col overflow-hidden rounded-lg bg-white transition-transform duration-200 hover:scale-[1.01]',
                'border border-padel-divider/50',
                className,
            )}
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={venue.image}
                    alt={venue.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                {venue.isOfficial && (
                    <span className="absolute top-3 left-3 rounded-full bg-padel-primary px-2.5 py-1 text-xs font-medium text-white">
                        Resmi
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base font-semibold text-padel-dark">{venue.name}</h3>

                <div className="mt-1.5 flex items-center gap-1 text-sm text-padel-body">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{venue.location}</span>
                </div>

                <div className="mt-1 flex items-center gap-1 text-sm text-padel-body">
                    <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        {venue.courtCount} lapangan
                    </span>
                </div>

                {/* Facilities */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {venue.facilities.slice(0, 3).map((facility) => (
                        <FacilityTag key={facility.name} name={facility.name} />
                    ))}
                    {venue.facilities.length > 3 && (
                        <span className="inline-flex items-center px-1 text-xs text-padel-body">
                            +{venue.facilities.length - 3}
                        </span>
                    )}
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="text-sm">
                        <span className="font-semibold text-padel-dark">
                            Rp {venue.priceRange.min.toLocaleString('id-ID')}
                        </span>
                        <span className="text-padel-body"> / jam</span>
                    </div>

                    {venue.isOfficial ? (
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onBookNow?.(venue);
                            }}
                            className="bg-padel-primary text-white hover:bg-padel-primary/90"
                        >
                            Pesan Sekarang
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onContactVenue?.(venue);
                            }}
                            className="border-padel-primary/30 text-padel-primary hover:bg-padel-primary/5"
                        >
                            Hubungi Venue
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
