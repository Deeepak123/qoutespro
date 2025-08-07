import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-temp',
  templateUrl: './temp.component.html',
  styleUrls: ['./temp.component.scss']
})
export class TempComponent implements OnInit {

  htmlInput: string = '';
  extractedNumbers: number[] = [];
  output: string[] = [];
  extractedText: string = '';
  betNumber: number = 0;
  userInput: number = 0;

  wheel = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
    27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26
  ];

  ngOnInit(): void {
  }

  extractNumbers(from: any): void {
    this.extractedNumbers = [];

    // Create a dummy DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.htmlInput, 'text/html');
    let elements: NodeListOf<HTMLElement> | null = null;

    if (from == "playT") {
      elements = doc.querySelectorAll('.roulette-history-item__value-text--XeOtB');
    } else if (from == "evo") {
      elements = doc.querySelectorAll('.value--dd5c7');
    }

    if (elements) {
      elements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && !isNaN(Number(text))) {
          this.extractedNumbers.push(Number(text));
        }
      });
    }

    this.extractedText = this.extractedNumbers.join(',');
    console.log(this.extractedNumbers);

    console.log("--------------LINE WISE-------------");
    this.linewise();

    console.log("--------------ALTERNATE WISE-------------");
    this.alternateWise();

    this.goldAlternateTrick();

    // this.check1();
  }

  onExtractedTextChange() {
    const parts = this.extractedText.split(',').map(p => p.trim());
    this.extractedNumbers = parts.map(Number).filter(num => !isNaN(num));

    const input = Number(this.userInput);

    console.log("--------------LINE WISE-------------");
    this.linewise();

    console.log("--------------ALTERNATE WISE-------------");
    this.alternateWise();

    this.goldAlternateTrick();

  }

  getRouletteDistancesLine() {
    const reversed = [...this.extractedNumbers].reverse();
    this.output = []; // make sure this is initialized

    for (let i = 1; i < reversed.length; i++) {
      const current = reversed[i];
      const previous = reversed[i - 1];

      const prevIndex = this.wheel.indexOf(previous);
      const currentIndex = this.wheel.indexOf(current);

      if (prevIndex === -1 || currentIndex === -1) {
        this.output.push(`${previous}, ${current} = INVALID`);
        continue;
      }

      const rightDistance = (currentIndex - prevIndex + this.wheel.length) % this.wheel.length;
      const leftDistance = (prevIndex - currentIndex + this.wheel.length) % this.wheel.length;

      if (rightDistance < leftDistance) {
        this.output.push(`${previous}, ${current} = RIGHT ${rightDistance}`);
      } else if (leftDistance < rightDistance) {
        this.output.push(`${previous}, ${current} = LEFT ${leftDistance}`);
      } else {
        this.output.push(`${previous}, ${current} = SAME`);
      }
    }
  }

  getDistance(from: number, to: number): { direction: 'LEFT' | 'RIGHT'; distance: number } {
    const fromIndex = this.wheel.indexOf(from);
    const toIndex = this.wheel.indexOf(to);
    if (fromIndex === -1 || toIndex === -1) throw new Error('Invalid numbers');

    let leftDistance = 0;
    let rightDistance = 0;

    // Count LEFT distance (excluding current, including target)
    let i = fromIndex;
    while (true) {
      i = (i - 1 + this.wheel.length) % this.wheel.length;
      leftDistance++;
      if (this.wheel[i] === to) break;
    }

    // Count RIGHT distance (excluding current, including target)
    i = fromIndex;
    while (true) {
      i = (i + 1) % this.wheel.length;
      rightDistance++;
      if (this.wheel[i] === to) break;
    }

    return leftDistance <= rightDistance
      ? { direction: 'LEFT', distance: leftDistance }
      : { direction: 'RIGHT', distance: rightDistance };
  }

  getNextBetNumber(current: number, direction: 'LEFT' | 'RIGHT', distance: number): number {
    const index = this.wheel.indexOf(current);
    if (index === -1) throw new Error('Invalid number');
    return direction === 'LEFT'
      ? this.wheel[(index - distance + this.wheel.length) % this.wheel.length]
      : this.wheel[(index + distance) % this.wheel.length];
  }

  lineDistanceLogic(incrementDistance: any) {
    debugger;
    const failuresBeforeSuccess: number[] = [];
    const sequence = this.extractedNumbers;

    const resultLog: {
      prev: number;
      curr: number;
      came: number;
      expected: number;
      direction: 'LEFT' | 'RIGHT';
      distance: number;
      adjustedDistance: number;
      success: boolean;
      failureCount: number;
    }[] = [];

    let failureCount = 0; // Track ongoing failures across iterations

    for (let i = sequence.length - 1; i > 0; i--) {
      const prev = sequence[i];
      const curr = sequence[i - 1];
      const came = sequence[i - 2];

      const { direction, distance } = this.getDistance(prev, curr);
      const adjustedDistance = distance + incrementDistance;
      const expected = this.getNextBetNumber(curr, direction, adjustedDistance);

      const success = came === expected;
      if (success) {
        resultLog.push({
          failureCount: success ? failureCount : -1,
          prev,
          curr,
          came,
          expected,
          direction,
          distance,
          adjustedDistance,
          success,
        });
        failureCount = 0;
      } else {
        failureCount++;
      }
    }

    return resultLog;
  }

  alterDistanceLogic(incrementDistance: any) {
    debugger;
    const failuresBeforeSuccess: number[] = [];
    const sequence = this.extractedNumbers;

    const resultLog: {
      prev: number;
      curr: number;
      came: number;
      expected: number;
      direction: 'LEFT' | 'RIGHT';
      distance: number;
      adjustedDistance: number;
      success: boolean;
      failureCount: number;
    }[] = [];

    let failureCount = 0; // Track ongoing failures across iterations

    for (let i = sequence.length - 1; i >= 4; i--) {
      const prev = sequence[i];
      const curr = sequence[i - 2];
      const came = sequence[i - 4];

      const { direction, distance } = this.getDistance(prev, curr);
      const adjustedDistance = distance + incrementDistance;
      const expected = this.getNextBetNumber(curr, direction, adjustedDistance);

      const success = came === expected;
      if (success) {
        resultLog.push({
          failureCount: success ? failureCount : -1,
          prev,
          curr,
          came,
          expected,
          direction,
          distance,
          adjustedDistance,
          success,
        });
        failureCount = 0;
      } else {
        failureCount++;
      }
    }

    return resultLog;
  }

  printFailureList(resultLog: any[]) {
    const failureCountsOnly = resultLog
      .map(entry => entry.failureCount);

    console.log('Failure Counts:', failureCountsOnly);
    let totalProfit = 0;
    let totalLoss = 0;

    failureCountsOnly.forEach((count, index) => {
      if (count > 36) {
        // Full failure
        totalLoss += 36;
        // console.log(`Failure #${index + 1}: FULL LOSS of 36`);
      } else {
        // Partial loss but succeeded
        const profit = 36 - count;
        totalProfit += profit;
        //totalLoss += count;
        // console.log(`Failure #${index + 1}: Success at ${count}, Profit: ${profit}, Loss: ${count}`);
      }
    });

    const net = totalProfit - totalLoss;

    console.log(`\nTotal Profit: ${totalProfit}`);
    console.log(`Total Loss: ${totalLoss}`);
    console.log(`Net Profit/Loss: ${net}`);

    const maxRounds = 36;
    const successWithin36 = failureCountsOnly.filter(gap => gap <= maxRounds);
    const failOver36 = failureCountsOnly.filter(gap => gap > maxRounds);

    console.log("✅ Success within 36:", successWithin36.length); // 14
    console.log("❌ Fail over 36:", failOver36.length); // 5
    console.log("📊 Success Rate:", ((successWithin36.length / failOver36.length) * 100).toFixed(2) + "%");
  }

  afterGapsSameDistanceLogic() {
    const sequence = this.extractedNumbers; // latest to oldest

    const resultLog: {
      failureCount: number;
      prev: number;
      curr: number;
      came: number;
      expected: number;
      direction: 'LEFT' | 'RIGHT';
      distance: number;
      success: boolean;
    }[] = [];

    let failureCount = 0;

    for (let i = sequence.length - 1; i >= 2; i--) {
      const i0 = sequence[i];       // oldest
      const i1 = sequence[i - 1];   // next
      const i2 = sequence[i - 2];   // came after that

      const { direction, distance } = this.getDistance(i0, i1);
      const expected = this.getNextBetNumber(i1, direction, distance);

      const success = i2 === expected;

      if (success) {
        resultLog.push({
          failureCount: success ? failureCount : -1,
          prev: i0,
          curr: i1,
          came: i2,
          expected,
          direction,
          distance,
          success,
        });
        failureCount = 0;
      } else {
        failureCount++;
      }
    }

    return resultLog;
  }

  howManyLeftRightStats() {
    const reversed = [...this.extractedNumbers].reverse();
    this.output = [];

    const leftCounts: { [key: number]: number } = {};
    const rightCounts: { [key: number]: number } = {};

    const leftGaps: { [key: number]: number[] } = {};
    const rightGaps: { [key: number]: number[] } = {};

    const lastSeenLeftIndex: { [key: number]: number } = {};
    const lastSeenRightIndex: { [key: number]: number } = {};

    for (let i = 1; i < reversed.length; i++) {
      const current = reversed[i];
      const previous = reversed[i - 1];

      const prevIndex = this.wheel.indexOf(previous);
      const currentIndex = this.wheel.indexOf(current);

      if (prevIndex === -1 || currentIndex === -1) {
        this.output.push(`${previous}, ${current} = INVALID`);
        continue;
      }

      const rightDistance = (currentIndex - prevIndex + this.wheel.length) % this.wheel.length;
      const leftDistance = (prevIndex - currentIndex + this.wheel.length) % this.wheel.length;

      if (rightDistance < leftDistance) {
        this.output.push(`${previous}, ${current} = RIGHT ${rightDistance}`);

        rightCounts[rightDistance] = (rightCounts[rightDistance] || 0) + 1;

        if (rightCounts[rightDistance] > 1 && lastSeenRightIndex[rightDistance] !== undefined) {
          const gap = i - lastSeenRightIndex[rightDistance] - 1;
          if (!rightGaps[rightDistance]) rightGaps[rightDistance] = [];
          rightGaps[rightDistance].push(gap);
        }
        lastSeenRightIndex[rightDistance] = i;

      } else if (leftDistance < rightDistance) {
        this.output.push(`${previous}, ${current} = LEFT ${leftDistance}`);

        leftCounts[leftDistance] = (leftCounts[leftDistance] || 0) + 1;

        if (leftCounts[leftDistance] > 1 && lastSeenLeftIndex[leftDistance] !== undefined) {
          const gap = i - lastSeenLeftIndex[leftDistance] - 1;
          if (!leftGaps[leftDistance]) leftGaps[leftDistance] = [];
          leftGaps[leftDistance].push(gap);
        }
        lastSeenLeftIndex[leftDistance] = i;

      } else {
        this.output.push(`${previous}, ${current} = SAME`);
      }
    }

    console.log("----------------STATS LEFT RIGHT TYPE--------------------");
    console.log("LEFT Counts:", leftCounts);
    console.log("RIGHT Counts:", rightCounts);

    console.log("LEFT Gaps:", leftGaps);     // Example: LEFT 3: [4, 1, 2]
    console.log("RIGHT Gaps:", rightGaps);   // Example: RIGHT 2: [5, 3, 1]

    const calculateProfitStats = (gapsMap: { [key: number]: number[] }, side: string) => {
      Object.keys(gapsMap).forEach(key => {
        const failureCountsOnly = gapsMap[+key];
        let totalProfit = 0;
        let totalLoss = 0;
        const maxRounds = 18;

        failureCountsOnly.forEach((count) => {
          if (count > maxRounds) {
            totalLoss += maxRounds;
          } else {
            const profit = 36 - count;
            totalProfit += profit;
            totalLoss += count;
          }
        });

        const net = totalProfit - totalLoss;
        const successWithin36 = failureCountsOnly.filter(gap => gap <= maxRounds);
        const failOver36 = failureCountsOnly.filter(gap => gap > maxRounds);
        const total = failureCountsOnly.length;

        console.log(`\n💥 ${side}${key} PROFIT STATS:`);
        console.log(`Total Entries: ${total}`);
        console.log(`✅ Success within 18 rounds: ${successWithin36.length}`);
        console.log(`❌ Failures over 18 rounds: ${failOver36.length}`);
        console.log(`Total Profit: ${totalProfit}`);
        console.log(`Total Loss: ${totalLoss}`);
        console.log(`Net Profit/Loss: ${net}`);
        console.log(`📊 Success Rate: ${((successWithin36.length / total) * 100).toFixed(2)}%`);
      });
    };

    console.log("\n============= PROFIT STATS FOR LEFT =============");
    calculateProfitStats(leftGaps, "LEFT");

    console.log("\n============= PROFIT STATS FOR RIGHT =============");
    calculateProfitStats(rightGaps, "RIGHT");
  }

  getWheelNeighbors(num: number): { left: number, right: number } {
    const index = this.wheel.indexOf(num);
    if (index === -1) throw new Error(`Number ${num} not found on wheel`);
    const left = this.wheel[(index - 1 + this.wheel.length) % this.wheel.length];
    const right = this.wheel[(index + 1) % this.wheel.length];
    return { left, right };
  }

  linewise() {
    let failureCount = 0;
    const failureGaps: number[] = [];
    // Reverse iteration
    for (let i = this.extractedNumbers.length - 1; i > 0; i--) {
      const current = this.extractedNumbers[i];
      const previous = this.extractedNumbers[i - 1];

      try {
        const { left, right } = this.getWheelNeighbors(current);
        let result = "";

        if (previous === left) {
          result = `${previous}, ${current}`;
          result += ` | SUCCESS | Neighbor: LEFT | Gap: ${failureCount}`;
          failureGaps.push(failureCount);
          failureCount = 0;
        } else if (previous === right) {
          result = `${previous}, ${current}`;
          result += ` | SUCCESS | Neighbor: RIGHT | Gap: ${failureCount}`;
          failureGaps.push(failureCount);
          failureCount = 0;
        } else {
          //result += ` | FAIL`;
          failureCount++;
        }

        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    console.log(failureGaps);
    this.profitCalculate();
  }

  check1() {
    let failureCount = 0;
    const failureGaps: number[] = [];
    const repeatCounts: { number: number; count: number }[] = [];

    let countTarget: number | null = null;
    let repeatCount = 0;
    let firstSuccess = true;

    // Reverse iteration
    for (let i = this.extractedNumbers.length - 1; i >= 2; i--) {
      const current = this.extractedNumbers[i];
      const previous = this.extractedNumbers[i - 2];


      try {
        const { left, right } = this.getWheelNeighbors(current);
        let result = "";

        if (previous === left || previous === right) {
          result = `${previous}, ${current}`;
          result += ` | SUCCESS | Neighbor: ${previous === left ? "LEFT" : "RIGHT"} | Gap: ${failureCount}`;
          failureGaps.push(failureCount);
          failureCount = 0;

          // If not first success, log the repeat count
          if (!firstSuccess && countTarget !== null) {
            repeatCounts.push({ number: countTarget, count: repeatCount });
            console.log(`Repeat count of ${countTarget} before next success: ${repeatCount}`);
          }

          // Prepare for next round
          countTarget = previous;
          repeatCount = 0;
          firstSuccess = false;

        } else {
          failureCount++;

          // Count if current number matches the last successful "previous"
          if (countTarget !== null && current === countTarget) {
            repeatCount++;
          }
        }

        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    // Log final target repeat count if exists
    if (countTarget !== null) {
      repeatCounts.push({ number: countTarget, count: repeatCount });
      console.log(`Final repeat count of ${countTarget}: ${repeatCount}`);
    }

    console.log("Failure Gaps:", failureGaps);
    console.log("Repeat Counts:", repeatCounts);
    this.profitCalculate();
  }


  profitCalculate() {
    const failureGaps: number[] = [];
    let failureCount = 0;
    let totalProfit = 0;
    let lastSuccessDirection: 'LEFT' | 'RIGHT' | null = null;

    // Reverse iteration
    for (let i = this.extractedNumbers.length - 1; i > 0; i--) {
      const current = this.extractedNumbers[i];
      const previous = this.extractedNumbers[i - 1];

      try {
        const { left, right } = this.getWheelNeighbors(current);
        let result = '';
        let currentDirection: 'LEFT' | 'RIGHT' | null = null;

        if (previous === left) {
          currentDirection = 'LEFT';
        } else if (previous === right) {
          currentDirection = 'RIGHT';
        }

        if (currentDirection) {
          const { profit, outcome } = this.calculateDirectionalProfit(
            failureCount,
            currentDirection,
            lastSuccessDirection
          );

          result = `${previous}, ${current} | ${outcome} | Direction: ${currentDirection} | Gap: ${failureCount} | Profit: ${profit}`;
          totalProfit += profit;
          lastSuccessDirection = currentDirection;
          failureCount = 0;

          //console.log(result);
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(error);
      }
    }

    console.log('Total Profit:', totalProfit);
  }

  calculateDirectionalProfit(
    gap: number,
    currentDirection: 'LEFT' | 'RIGHT',
    lastDirection: 'LEFT' | 'RIGHT' | null
  ): { profit: number; outcome: string } {
    if (lastDirection === null || currentDirection === lastDirection) {
      const profit = 36 - gap;
      return { profit, outcome: 'WIN' };
    } else {
      const loss = -gap;
      return { profit: loss, outcome: 'LOSS (Wrong Direction)' };
    }
  }


  alternateWise() {
    let failureCount = 0;
    const failureGaps: number[] = [];

    // Reverse iterate and compare i with i - 2 (skipping i - 1)
    for (let i = this.extractedNumbers.length - 1; i >= 2; i--) {
      const current = this.extractedNumbers[i];
      const previous = this.extractedNumbers[i - 2];

      try {
        const { left, right } = this.getWheelNeighbors(current);
        let result = `${previous}, ${current}`;

        if (previous === left) {
          result += ` | SUCCESS | Neighbor: LEFT | Gap: ${failureCount}`;
          failureGaps.push(failureCount);
          failureCount = 0;
        } else if (previous === right) {
          result += ` | SUCCESS | Neighbor: RIGHT | Gap: ${failureCount}`;
          failureGaps.push(failureCount);
          failureCount = 0;
        } else {
          failureCount++;
          continue; // skip logging for failure cases
        }

        console.log(result);
      } catch (error) {
        console.error('Error fetching neighbors:', error);
      }
    }

    console.log('Failure Gaps:', failureGaps);
    this.profitCalculateAlter();
  }


  profitCalculateAlter() {
    const failureGaps: number[] = [];
    let failureCount = 0;
    let totalProfit = 0;
    let lastSuccessDirection: 'LEFT' | 'RIGHT' | null = null;

    // Reverse iteration
    for (let i = this.extractedNumbers.length - 1; i >= 2; i--) {
      const current = this.extractedNumbers[i];
      const previous = this.extractedNumbers[i - 2];


      try {
        const { left, right } = this.getWheelNeighbors(current);
        let result = '';
        let currentDirection: 'LEFT' | 'RIGHT' | null = null;

        if (previous === left) {
          currentDirection = 'LEFT';
        } else if (previous === right) {
          currentDirection = 'RIGHT';
        }

        if (currentDirection) {
          const { profit, outcome } = this.calculateDirectionalProfit(
            failureCount,
            currentDirection,
            lastSuccessDirection
          );

          result = `${previous}, ${current} | ${outcome} | Direction: ${currentDirection} | Gap: ${failureCount} | Profit: ${profit}`;
          totalProfit += profit;
          lastSuccessDirection = currentDirection;
          failureCount = 0;

          console.log(result);
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(error);
      }
    }

    console.log('Total Profit:', totalProfit);
  }

  public goldLinewiseN1N2Idea() {
    let failureGap = 0;
    const failureGaps: number[] = [];
    for (let i = this.extractedNumbers.length - 1; i >= 2; i--) {
      const i0 = this.extractedNumbers[i];
      const iMinus1 = this.extractedNumbers[i - 1];
      const iMinus2 = this.extractedNumbers[i - 2];

      const neighbor1 = this.getNeighbors(i0, 2); // skip 1
      const neighbor2 = this.getNeighbors(i0, 3); // skip 2

      if (neighbor1.includes(iMinus1) || neighbor2.includes(iMinus1)) {
        const direction = this.getDirectionByPosition(i0, iMinus1);

        const iMinus1Immediate = this.getNeighbors(iMinus1, 1);
        const isValid =
          direction === 'LEFT' ? iMinus2 === iMinus1Immediate[0] :
            direction === 'RIGHT' ? iMinus2 === iMinus1Immediate[1] : false;

        // console.log(`\nAnalyzing i0=${i0}, i-1=${iMinus1}, i-2=${iMinus2}`);
        // console.log(`Neighbor1 (skip 1) of ${i0}: ${neighbor1}`);
        // console.log(`Neighbor2 (skip 2) of ${i0}: ${neighbor2}`);
        // console.log(`[Direction: ${direction}]`);
        // console.log(`Result: ${isValid ? '✅ Match' : '❌ No Match'}`);

        if (isValid) {
          failureGaps.push(failureGap); // store the gap count
          failureGap = 0; // reset counter
        } else {
          failureGap++;
        }
      }
    }
    console.log('\n🔁 N1+N2', failureGaps);
  }

  public goldLinewiseN1Idea() {
    let failureGap = 0;
    const failureGaps: number[] = [];
    for (let i = this.extractedNumbers.length - 1; i >= 2; i--) {
      const i0 = this.extractedNumbers[i];
      const iMinus1 = this.extractedNumbers[i - 1];
      const iMinus2 = this.extractedNumbers[i - 2];

      const neighbor1 = this.getNeighbors(i0, 2); // skip 1
      //const neighbor2 = this.getNeighbors(i0, 3); // skip 2

      if (neighbor1.includes(iMinus1)) {
        const direction = this.getDirectionByPosition(i0, iMinus1);

        const iMinus1Immediate = this.getNeighbors(iMinus1, 1);
        const isValid =
          direction === 'LEFT' ? iMinus2 === iMinus1Immediate[0] :
            direction === 'RIGHT' ? iMinus2 === iMinus1Immediate[1] : false;

        // console.log(`\nAnalyzing i0=${i0}, i-1=${iMinus1}, i-2=${iMinus2}`);
        // console.log(`Neighbor1 (skip 1) of ${i0}: ${neighbor1}`);
        // //console.log(`Neighbor2 (skip 2) of ${i0}: ${neighbor2}`);
        // console.log(`[Direction: ${direction}]`);
        // console.log(`Result: ${isValid ? '✅ Match' : '❌ No Match'}`);

        if (isValid) {
          failureGaps.push(failureGap); // store the gap count
          failureGap = 0; // reset counter
        } else {
          failureGap++;
        }
      }
    }
    console.log('\n🔁 N1', failureGaps);
  }

  // Get left and right neighbors up to given distance
  private getNeighbors(num: number, distance: number): number[] {
    const index = this.wheel.indexOf(num);
    if (index === -1) return [];

    const total = this.wheel.length;
    const left = this.wheel[(index - distance + total) % total];
    const right = this.wheel[(index + distance) % total];
    return [left, right];
  }

  getDirectionByPosition(from: number, neighbor: number): 'LEFT' | 'RIGHT' | 'UNKNOWN' {
    const fromIndex = this.wheel.indexOf(from);
    const neighborIndex = this.wheel.indexOf(neighbor);
    if (fromIndex === -1 || neighborIndex === -1) return 'UNKNOWN';

    const total = this.wheel.length;
    const distanceRight = (neighborIndex - fromIndex + total) % total;
    const distanceLeft = (fromIndex - neighborIndex + total) % total;

    // Allow max 18 steps either direction (half the wheel)
    if (distanceLeft <= 18 && distanceLeft < distanceRight) return 'LEFT';
    if (distanceRight <= 18 && distanceRight < distanceLeft) return 'RIGHT';

    // Handle rare equal case (e.g. wraparound)
    if (distanceLeft === distanceRight && distanceLeft !== 0) {
      return 'LEFT'; // or 'RIGHT' - pick one default
    }

    return 'UNKNOWN';
  }

  getNeighborsGold(num: number): { left: number; right: number } {
    const index = this.wheel.indexOf(num);
    if (index === -1) throw new Error(`Number ${num} not found on wheel`);
    const left = this.wheel[(index - 1 + this.wheel.length) % this.wheel.length];
    const right = this.wheel[(index + 1) % this.wheel.length];
    return { left, right };
  }

  getDirectionGold(from: number, to: number): 'LEFT' | 'RIGHT' | 'SAME' | 'NONE' {
    const neighbors = this.getNeighborsGold(from);
    if (to === from) return 'SAME';
    if (to === neighbors.left) return 'LEFT';
    if (to === neighbors.right) return 'RIGHT';
    return 'NONE';
  }

  goldAlternateTrick() {
    console.log('=== Gold Alternate Trick Analysis ===');
    let failureGap = 0;
    const failureGaps: number[] = [];

    for (let i = this.extractedNumbers.length - 1; i >= 3; i--) {
      const i0 = this.extractedNumbers[i];
      const i1 = this.extractedNumbers[i - 1];
      const i2 = this.extractedNumbers[i - 2];
      const i3 = this.extractedNumbers[i - 3];

      const dir1 = this.getDirectionGold(i0, i2);

      if (dir1 !== 'NONE') {
        console.log(`\n🔍 Analyzing sequence: i-3=${i3}, i-2=${i2}, i-1=${i1}, i0=${i0}`);
        console.log(`✅ Step 1: alt=${i2}, before=${i0}, ${dir1}`);

        const dir2 = this.getDirectionGold(i2, i3);

        // ✅ ADDITION: check that i2 and i3 are not same
        if (dir2 !== 'NONE' && dir2 !== 'SAME' && i2 !== i3) {
          console.log(`✅ Step 2: near=${i3} before=${i2}, ${dir2}`);
          console.log(`✅ PASSED:`);
          failureGaps.push(failureGap); // store the gap count
          failureGap = 0; // reset counter
        } else {
          failureGap++;
          console.log(`❌ Step 2: Failed - ${i2 === i3 ? 'i2 and i3 are SAME' : `not near =${i3} before=${i2}`}`);
        }
      }
    }

    console.log('\n LL -> RR -> L/R -> SAME LEFT/RIGHT:', failureGaps);
  }


  goldAlternateTrickSameLeft() {
    let failureGap = 0;
    const failureGaps: number[] = [];

    for (let i = this.extractedNumbers.length - 1; i >= 3; i--) {
      const i0 = this.extractedNumbers[i];
      const i1 = this.extractedNumbers[i - 1];
      const i2 = this.extractedNumbers[i - 2];
      const i3 = this.extractedNumbers[i - 3];

      if (i0 === i2) {
        console.log(`\n🔍 Analyzing sequence: i-3=${i3}, i-2=${i2}, i-1=${i1}, i0=${i0}`);
        console.log(`✅ Step 1: same=${i2}, before=${i0}`);

        const dir = this.getDirectionGold(i2, i3);

        // ✅ ADDITION: check that i2 and i3 are not same
        if (dir === 'LEFT') {
          console.log(`✅ Step 2: near=${i3} before=${i2}, ${dir}`);
          console.log(`✅ PASSED:`);
          failureGaps.push(failureGap); // store the gap count
          failureGap = 0; // reset counter
        } else {
          failureGap++;
          console.log(`❌ Step 2: i2=${i2} → i3=${i3} is not LEFT (${dir})`);
        }
      }
    }

    console.log('\n SAME LEFT:', failureGaps);
  }

  goldAlternateTrickSameRight() {
    let failureGap = 0;
    const failureGaps: number[] = [];

    for (let i = this.extractedNumbers.length - 1; i >= 3; i--) {
      const i0 = this.extractedNumbers[i];
      const i1 = this.extractedNumbers[i - 1];
      const i2 = this.extractedNumbers[i - 2];
      const i3 = this.extractedNumbers[i - 3];

      if (i0 === i2) {
        console.log(`\n🔍 Analyzing sequence: i-3=${i3}, i-2=${i2}, i-1=${i1}, i0=${i0}`);
        console.log(`✅ Step 1: same=${i2}, before=${i0}`);

        const dir = this.getDirectionGold(i2, i3);

        // ✅ ADDITION: check that i2 and i3 are not same
        if (dir === 'RIGHT') {
          console.log(`✅ Step 2: near=${i3} before=${i2}, ${dir}`);
          console.log(`✅ PASSED:`);
          failureGaps.push(failureGap); // store the gap count
          failureGap = 0; // reset counter
        } else {
          failureGap++;
          console.log(`❌ Step 2: i2=${i2} → i3=${i3} is not RIGHT (${dir})`);
        }
      }
    }

    console.log('\n SAME RIGHT:', failureGaps);
  }

  linewiseLEFTRIGHTCHECK() {
    let failureCount = 0;
    const failureGaps: number[] = [];

    for (let i = this.extractedNumbers.length - 1; i > 1; i--) {
      const start = this.extractedNumbers[i];
      const current = this.extractedNumbers[i - 1];
      const previous = this.extractedNumbers[i - 2];

      try {
        const currentNeighbors = this.getWheelNeighbors(current);
        const left = currentNeighbors.left;
        const right = currentNeighbors.right;

        const startToCurrent = this.getDistance(start, current); // returns {direction, distance}
        let expectedNeighbor: number;
        let result = "";

        if (startToCurrent.direction === 'LEFT') {
          expectedNeighbor = left;
          if (previous === left) {
            result = `${previous}, ${current}, ${start} | SUCCESS | Neighbor: LEFT | Gap: ${failureCount}`;
            failureGaps.push(failureCount);
            failureCount = 0;
          } else {
            failureCount++;
          }
        } else if (startToCurrent.direction === 'RIGHT') {
          expectedNeighbor = right;
          if (previous === right) {
            result = `${previous}, ${current}, ${start} | SUCCESS | Neighbor: RIGHT | Gap: ${failureCount}`;
            failureGaps.push(failureCount);
            failureCount = 0;
          } else {
            failureCount++;
          }
        }

        if (result) console.log(result);

      } catch (error) {
        console.error(error);
      }
    }

    console.log('Failure Gaps:', failureGaps);
    // this.profitCalculate();
  }




}


