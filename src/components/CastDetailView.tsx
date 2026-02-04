import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react';
import { tmdbFetch, getTMDBImageUrl } from '../lib/tmdb';

interface CastDetailViewProps {
  castId: number;
  onBack: () => void;
  onShowDetail?: (id: number, type: 'movie' | 'tv') => void;
}

export function CastDetailView({ castId, onBack, onShowDetail }: CastDetailViewProps) {
  const [person, setPerson] = useState<any>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPerson() {
      try {
        const [personData, creditsData] = await Promise.all([
          tmdbFetch(`/person/${castId}`),
          tmdbFetch(`/person/${castId}/combined_credits`)
        ]);
        setPerson(personData);
        setCredits(creditsData.cast.sort((a: any, b: any) => 
          (b.vote_average || 0) - (a.vote_average || 0)
        ).slice(0, 20));
      } catch (error) {
        console.error('Failed to load person:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPerson();
  }, [castId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl text-foreground">Loading...</div>
      </div>
    );
  }

  if (!person) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 2k:py-4 4k:py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 2k:gap-3 4k:gap-4 text-foreground hover:text-primary transition-colors text-sm 2k:text-lg 4k:text-2xl"
          >
            <ArrowLeft className="w-5 h-5 2k:w-7 2k:h-7 4k:w-10 4k:h-10" />
            Back
          </button>
        </div>
      </header>

      {/* Person Info */}
      <div className="container mx-auto px-4 py-8 2k:py-12 4k:py-16">
        <div className="flex flex-col md:flex-row gap-8 2k:gap-12 4k:gap-16 mb-12 2k:mb-16 4k:mb-24">
          <img
            src={getTMDBImageUrl(person.profile_path, 'w500')}
            alt={person.name}
            className="w-full md:w-64 2k:w-96 4k:w-[32rem] h-auto rounded-xl shadow-2xl"
          />
          <div className="flex-1">
            <h1 className="text-4xl 2k:text-6xl 4k:text-8xl font-bold mb-4 2k:mb-6 4k:mb-8">{person.name}</h1>
            
            {person.birthday && (
              <div className="flex items-center gap-2 2k:gap-3 4k:gap-4 mb-2 2k:mb-3 4k:mb-4 text-sm 2k:text-xl 4k:text-3xl text-muted-foreground">
                <Calendar className="w-4 h-4 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
                Born: {new Date(person.birthday).toLocaleDateString()}
                {person.deathday && ` - Died: ${new Date(person.deathday).toLocaleDateString()}`}
              </div>
            )}
            
            {person.place_of_birth && (
              <div className="flex items-center gap-2 2k:gap-3 4k:gap-4 mb-4 2k:mb-6 4k:mb-8 text-sm 2k:text-xl 4k:text-3xl text-muted-foreground">
                <MapPin className="w-4 h-4 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
                {person.place_of_birth}
              </div>
            )}

            {person.known_for_department && (
              <div className="flex items-center gap-2 2k:gap-3 4k:gap-4 mb-4 2k:mb-6 4k:mb-8 text-sm 2k:text-xl 4k:text-3xl">
                <User className="w-4 h-4 2k:w-6 2k:h-6 4k:w-8 4k:h-8" />
                Known for: {person.known_for_department}
              </div>
            )}

            {person.biography && (
              <div className="prose prose-invert max-w-none">
                <h2 className="text-xl 2k:text-3xl 4k:text-5xl font-semibold mb-3 2k:mb-4 4k:mb-6">Biography</h2>
                <p className="text-sm 2k:text-lg 4k:text-2xl text-muted-foreground leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Credits */}
        {credits.length > 0 && (
          <div>
            <h2 className="text-2xl 2k:text-4xl 4k:text-6xl font-bold mb-6 2k:mb-8 4k:mb-12">Known For</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 2k:gap-6 4k:gap-8">
              {credits.map((credit) => (
                <button
                  key={`${credit.id}-${credit.credit_id}`}
                  onClick={() => {
                    const mediaType = credit.media_type || (credit.title ? 'movie' : 'tv');
                    if (onShowDetail) {
                      onShowDetail(credit.id, mediaType);
                    }
                  }}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={getTMDBImageUrl(credit.poster_path, 'w342')}
                      alt={credit.title || credit.name}
                      className="w-full h-auto"
                    />
                  </div>
                  <h3 className="mt-2 2k:mt-3 4k:mt-4 text-xs 2k:text-base 4k:text-xl font-medium line-clamp-2">
                    {credit.title || credit.name}
                  </h3>
                  {credit.character && (
                    <p className="text-xs 2k:text-sm 4k:text-lg text-muted-foreground line-clamp-1">
                      as {credit.character}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
