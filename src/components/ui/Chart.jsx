import React from 'react';
import { View, Text } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryVoronoiContainer,
} from 'victory-native';
import { colors } from '../../config/theme'; // 1. Import colors from your central theme file
import { cn } from '../../lib/utils';

// --- Context to provide chart config to children ---
const ChartContext = React.createContext(null);

const useChart = () => {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
};

// --- Helper to create a Victory theme from Tailwind config ---
const getVictoryTheme = () => ({
  axis: {
    style: {
      axis: { stroke: colors.border, strokeWidth: 1 },
      tickLabels: {
        fill: colors['muted-foreground'],
        fontSize: 12,
        padding: 5,
      },
      grid: { stroke: colors.border, strokeDasharray: '4, 4' },
    },
  },
  bar: {
    style: {
      data: {
        fill: colors.primary,
      },
    },
  },
});

// --- Chart Container: The main wrapper ---
const ChartContainer = ({ config, children, className, ...props }) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <View
        className={cn('w-full aspect-video justify-center', className)}
        {...props}
      >
        {/* VictoryChart is the base for all charts */}
        <VictoryChart
          theme={getVictoryTheme()}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => {
                // This stringifies the datum for the tooltip to parse
                return JSON.stringify(datum);
              }}
              labelComponent={
                <ChartTooltipContent /> // Custom tooltip component
              }
            />
          }
        >
          {children}
        </VictoryChart>
      </View>
    </ChartContext.Provider>
  );
};

// --- Custom Tooltip Component ---
const ChartTooltipContent = props => {
  const { datum, x, y } = props;
  const { config } = useChart();

  const parsedDatum = React.useMemo(() => {
    try {
      return JSON.parse(datum);
    } catch {
      return {};
    }
  }, [datum]);

  if (!parsedDatum._y) return null;

  return (
    <View
      style={{ transform: [{ translateX: x - 50 }, { translateY: y - 60 }] }}
    >
      <View className="rounded-lg border border-border bg-background p-2.5 shadow-lg min-w-[8rem]">
        <Text className="text-center font-medium text-foreground mb-1">
          {parsedDatum._x}
        </Text>
        {Object.entries(parsedDatum)
          .filter(([key]) => key.startsWith('_y') && parsedDatum[key] !== null)
          .map(([key, value]) => {
            const dataKey = parsedDatum.childName || key;
            const itemConfig = config[dataKey] || {};
            return (
              <View
                key={key}
                className="flex-row items-center justify-between gap-2"
              >
                <View className="flex-row items-center gap-1.5">
                  <View
                    className="h-2.5 w-2.5 rounded-[2px]"
                    style={{
                      backgroundColor: itemConfig.color || colors.primary,
                    }}
                  />
                  <Text className="text-muted-foreground">
                    {itemConfig.label || dataKey}
                  </Text>
                </View>
                <Text className="font-medium text-foreground">
                  {value.toLocaleString()}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
};
ChartTooltipContent.role = 'tooltip';

// --- Custom Legend Component ---
const ChartLegendContent = ({ payload }) => {
  const { config } = useChart();

  if (!payload) return null;

  return (
    <View className="flex-row items-center justify-center flex-wrap gap-4 pt-3">
      {payload.map((item, index) => {
        const itemConfig = config[item.id] || {};
        return (
          <View key={index} className="flex-row items-center gap-1.5">
            <View
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-sm text-muted-foreground">
              {itemConfig.label || item.id}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// --- Re-exporting common Victory components for convenience ---
const ChartAxis = VictoryAxis;
const ChartBar = VictoryBar;

export {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartAxis,
  ChartBar,
};
