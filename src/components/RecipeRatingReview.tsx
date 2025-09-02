import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  StarHalf, 
  User, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  Award,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { RecipeRating, RecipeReview, calculateAverageRating } from '@/lib/recipeEnhancements';

interface RecipeRatingReviewProps {
  recipeId: string;
  recipeName: string;
  currentUserRating?: RecipeRating;
  ratings: RecipeRating[];
  reviews: RecipeReview[];
  onSubmitRating: (rating: Omit<RecipeRating, 'id' | 'created_at' | 'updated_at'>) => void;
  onSubmitReview: (review: Omit<RecipeReview, 'id' | 'created_at' | 'helpful_count'>) => void;
  onHelpfulReview: (reviewId: string) => void;
}

export const RecipeRatingReview = ({
  recipeId,
  recipeName,
  currentUserRating,
  ratings,
  reviews,
  onSubmitRating,
  onSubmitReview,
  onHelpfulReview
}: RecipeRatingReviewProps) => {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [cookingTips, setCookingTips] = useState('');
  const [recipeModifications, setRecipeModifications] = useState('');
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [difficultyActual, setDifficultyActual] = useState<'easier' | 'as_expected' | 'harder'>('as_expected');
  const [wouldMakeAgain, setWouldMakeAgain] = useState(true);

  const ratingStats = calculateAverageRating(ratings);
  
  useEffect(() => {
    if (currentUserRating) {
      setUserRating(currentUserRating.rating);
      setTimeTaken(currentUserRating.time_taken_minutes);
      setDifficultyActual(currentUserRating.cooking_difficulty_actual);
      setWouldMakeAgain(currentUserRating.would_make_again);
    }
  }, [currentUserRating]);

  const handleRatingSubmit = () => {
    if (userRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating before submitting',
        variant: 'destructive'
      });
      return;
    }

    onSubmitRating({
      recipe_id: recipeId,
      user_id: 'current_user', // This would come from auth context
      rating: userRating,
      review: reviewText || undefined,
      cooking_difficulty_actual: difficultyActual,
      time_taken_minutes: timeTaken,
      would_make_again: wouldMakeAgain
    });

    setShowRatingDialog(false);
    toast({
      title: 'Rating Submitted',
      description: 'Thank you for rating this recipe!'
    });
  };

  const handleReviewSubmit = () => {
    if (!reviewText.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write a review before submitting',
        variant: 'destructive'
      });
      return;
    }

    const tips = cookingTips.split('\n').filter(tip => tip.trim() !== '');
    
    onSubmitReview({
      recipe_id: recipeId,
      user_id: 'current_user', // This would come from auth context
      user_name: 'Current User', // This would come from auth context
      rating: userRating,
      review_text: reviewText,
      verified_cook: true, // Assuming they cooked it if they're reviewing
      cooking_tips: tips.length > 0 ? tips : undefined,
      recipe_modifications: recipeModifications || undefined
    });

    setShowReviewDialog(false);
    setReviewText('');
    setCookingTips('');
    setRecipeModifications('');
    
    toast({
      title: 'Review Submitted',
      description: 'Your review has been added!'
    });
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star 
            key={i} 
            className={`${size} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''} text-yellow-400 fill-current`}
            onClick={interactive ? () => setUserRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf 
            key={i} 
            className={`${size} text-yellow-400 fill-current`}
          />
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            className={`${size} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''} text-gray-300`}
            onClick={interactive ? () => setUserRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      }
    }
    
    return (
      <div 
        className="flex items-center gap-1"
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
      >
        {stars.map((star, index) => (
          <div key={index} className="relative">
            {star}
            {interactive && hoverRating > 0 && index < hoverRating && (
              <Star className={`${size} absolute inset-0 text-yellow-500 fill-current pointer-events-none`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getDifficultyIcon = (difficulty: 'easier' | 'as_expected' | 'harder') => {
    switch (difficulty) {
      case 'easier': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'harder': return <TrendingUp className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Ratings & Reviews
            </div>
            <div className="flex items-center gap-2">
              {!currentUserRating && (
                <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Rate Recipe
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
              <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    Write Review
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratingStats.count > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Overall Rating */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{ratingStats.average}</div>
                  <div className="flex items-center justify-center mb-2">
                    {renderStars(ratingStats.average)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {ratingStats.count} review{ratingStats.count !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {currentUserRating && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Your Rating</span>
                      {renderStars(currentUserRating.rating)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentUserRating.time_taken_minutes}min
                      </div>
                      <div className="flex items-center gap-1">
                        {getDifficultyIcon(currentUserRating.cooking_difficulty_actual)}
                        {currentUserRating.cooking_difficulty_actual.replace('_', ' ')}
                      </div>
                      {currentUserRating.would_make_again && (
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-green-500" />
                          Would make again
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                <h4 className="font-medium">Rating Distribution</h4>
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ratingStats.distribution[stars];
                  const percentage = ratingStats.count > 0 ? (count / ratingStats.count) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-8">{stars}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to review this recipe!
              </p>
              <Button onClick={() => setShowRatingDialog(true)}>
                Leave First Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recent Reviews</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.user_name}</span>
                        {review.verified_cook && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Cook
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {renderStars(review.rating, false, 'w-3 h-3')}
                        <span>•</span>
                        <span>{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onHelpfulReview(review.id)}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {review.helpful_count}
                  </Button>
                </div>
                
                <p className="text-sm mb-3">{review.review_text}</p>
                
                {review.cooking_tips && review.cooking_tips.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-1">Cooking Tips:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {review.cooking_tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {review.recipe_modifications && (
                  <div className="p-2 bg-muted/50 rounded text-sm">
                    <span className="font-medium">Modifications: </span>
                    {review.recipe_modifications}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rating Dialog */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate "{recipeName}"</DialogTitle>
          <DialogDescription>
            Share your experience cooking this recipe
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <label className="text-sm font-medium mb-3 block">Overall Rating</label>
            {renderStars(hoverRating || userRating, true, 'w-8 h-8')}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Time Taken (minutes)</label>
              <input
                type="number"
                value={timeTaken}
                onChange={(e) => setTimeTaken(parseInt(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 border rounded"
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty Level</label>
              <select
                value={difficultyActual}
                onChange={(e) => setDifficultyActual(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border rounded"
              >
                <option value="easier">Easier than expected</option>
                <option value="as_expected">As expected</option>
                <option value="harder">Harder than expected</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="would-make-again"
              checked={wouldMakeAgain}
              onChange={(e) => setWouldMakeAgain(e.target.checked)}
            />
            <label htmlFor="would-make-again" className="text-sm">
              I would make this recipe again
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">Review (Optional)</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this recipe..."
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRatingSubmit}>
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review for "{recipeName}"</DialogTitle>
            <DialogDescription>
              Help other cooks by sharing your detailed experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Review</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell others about your experience cooking this recipe..."
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Cooking Tips (Optional)</label>
              <Textarea
                value={cookingTips}
                onChange={(e) => setCookingTips(e.target.value)}
                placeholder="Share any tips that helped you succeed with this recipe... (one per line)"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Recipe Modifications (Optional)</label>
              <Textarea
                value={recipeModifications}
                onChange={(e) => setRecipeModifications(e.target.value)}
                placeholder="Did you make any changes to the original recipe?"
                className="mt-1"
                rows={2}
              />
            </div>
            
            <Separator />
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleReviewSubmit}>
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};