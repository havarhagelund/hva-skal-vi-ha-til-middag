'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'small' | 'large';
  onSelect?: () => void;
}

function RecipeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError || !src) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Ingen bilde</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}

export function RecipeCard({ recipe, variant = 'small', onSelect }: RecipeCardProps) {

  if (variant === 'large') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          <div className="md:w-1/2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              {recipe.image ? (
                <RecipeImage
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">Ingen bilde</span>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col gap-4">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">{recipe.title}</CardTitle>
              {recipe.intro && (
                <CardDescription className="text-base mt-2">
                  {recipe.intro}
                </CardDescription>
              )}
            </CardHeader>
            {recipe.summary && (
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recipe.summary}
                </p>
              </CardContent>
            )}
            <CardFooter className="p-0 mt-auto">
              <Button
                onClick={() => window.open(recipe.url, '_blank')}
                className="w-full"
                size="lg"
              >
                Se hele oppskriften
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onSelect}
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {recipe.image ? (
            <RecipeImage
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-2">Ingen bilde</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardHeader className="p-0">
            <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
            {(recipe.intro || recipe.summary) && (
              <CardDescription className="text-sm mt-1 line-clamp-2">
                {recipe.intro || recipe.summary}
              </CardDescription>
            )}
          </CardHeader>
        </div>
      </div>
    </Card>
  );
}

interface RecipeCardListProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
}

export function RecipeCardList({ recipes, onSelect }: RecipeCardListProps) {
  return (
    <div className="grid gap-4">
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={index}
          recipe={recipe}
          variant="small"
          onSelect={() => onSelect(recipe)}
        />
      ))}
    </div>
  );
}

