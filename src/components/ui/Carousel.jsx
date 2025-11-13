import React from 'react';
import { View } from 'react-native';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { Button } from './Button'; // Assuming you have this Button component

// --- Context to share carousel state and API ---
const CarouselContext = React.createContext(null);

const useCarousel = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
};

const Carousel = React.forwardRef(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback(api => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    React.useEffect(() => {
      if (!api || !setApi) return;
      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) return;
      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <View
          ref={ref}
          className={cn('relative', className)}
          accessibilityRole="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </View>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <View ref={carouselRef} className="overflow-hidden">
      <View
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row -ml-4' : 'flex-col -mt-4',
          className,
        )}
        {...props}
      />
    </View>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <View
      ref={ref}
      accessibilityRole="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          'absolute h-8 w-8 rounded-full',
          orientation === 'horizontal'
            ? 'top-1/2 left-2 -translate-y-1/2' // Adjusted for mobile
            : 'top-2 left-1/2 -translate-x-1/2 rotate-90',
          className,
        )}
        disabled={!canScrollPrev}
        onPress={scrollPrev}
        accessibilityLabel="Previous slide"
        {...props}
      >
        <ArrowLeft size={16} className="text-foreground" />
      </Button>
    );
  },
);
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef(
  ({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          'absolute h-8 w-8 rounded-full',
          orientation === 'horizontal'
            ? 'top-1/2 right-2 -translate-y-1/2' // Adjusted for mobile
            : 'bottom-2 left-1/2 -translate-x-1/2 rotate-90',
          className,
        )}
        disabled={!canScrollNext}
        onPress={scrollNext}
        accessibilityLabel="Next slide"
        {...props}
      >
        <ArrowRight size={16} className="text-foreground" />
      </Button>
    );
  },
);
CarouselNext.displayName = 'CarouselNext';

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
