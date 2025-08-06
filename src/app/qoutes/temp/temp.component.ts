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
    this.getRouletteDistancesLine();
    this.howManyLeftRightStats();
  }

  onExtractedTextChange() {
    const parts = this.extractedText.split(',').map(p => p.trim());
    this.extractedNumbers = parts.map(Number).filter(num => !isNaN(num));

    const input = Number(this.userInput);

    if (!isNaN(input)) {
      this.betNumber = this.nextBetLogic(input);
      console.log("Next Bet:", this.betNumber);
    } else {
      console.error("Invalid number input");
    }

    //next bet
    // this.betNumber = this.nextBetLogic(0);
    // this.betNumber = this.nextBetLogic(1);
    // this.betNumber = this.nextBetLogic(2);
    // this.betNumber = this.nextBetLogic(3);
    // this.betNumber = this.nextBetLogic(4);
    // this.betNumber = this.nextBetLogic(5);
    // this.betNumber = this.nextBetLogic(6);
    // this.betNumber = this.nextBetLogic(7);
    // this.betNumber  = this.nextBetLogic(8);
    // this.betNumber  = this.nextBetLogic(9);
    // this.betNumber  = this.nextBetLogic(10);

    // this.betNumber = this.nextBetLogic(-1);
    // this.betNumber = this.nextBetLogic(-2);
    // this.betNumber = this.nextBetLogic(-3);
    // this.betNumber = this.nextBetLogic(-4);
    // this.betNumber = this.nextBetLogic(-5);
    // this.betNumber = this.nextBetLogic(-6);
    // this.betNumber = this.nextBetLogic(-7);
    // this.betNumber = this.nextBetLogic(-8);
    // this.betNumber  = this.nextBetLogic(-9);
    // this.betNumber  = this.nextBetLogic(-10);
    // console.log("--------NEXT BET: " + this.betNumber)
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

    //LINE WISE
    const result0 = this.lineDistanceLogic(0);
    const result1 = this.lineDistanceLogic(1);
    const result2 = this.lineDistanceLogic(2);
    const result3 = this.lineDistanceLogic(3);
    const result4 = this.lineDistanceLogic(4);
    const result5 = this.lineDistanceLogic(5);
    const result6 = this.lineDistanceLogic(6);
    const result7 = this.lineDistanceLogic(7);
    const result8 = this.lineDistanceLogic(8);
    const result9 = this.lineDistanceLogic(9);
    const result10 = this.lineDistanceLogic(10);
    const result11 = this.lineDistanceLogic(11);
    const result12 = this.lineDistanceLogic(12);
    const result13 = this.lineDistanceLogic(13);
    const result14 = this.lineDistanceLogic(14);
    const result15 = this.lineDistanceLogic(15);
    const result16 = this.lineDistanceLogic(16);
    const result17 = this.lineDistanceLogic(17);
    const result18 = this.lineDistanceLogic(18);

    const result1a = this.lineDistanceLogic(-1);
    const result2a = this.lineDistanceLogic(-2);
    const result3a = this.lineDistanceLogic(-3);
    const result4a = this.lineDistanceLogic(-4);
    const result5a = this.lineDistanceLogic(-5);
    const result6a = this.lineDistanceLogic(-6);
    const result7a = this.lineDistanceLogic(-7);
    const result8a = this.lineDistanceLogic(-8);
    const result9a = this.lineDistanceLogic(-9);
    const result10a = this.lineDistanceLogic(-10);
    const result11a = this.lineDistanceLogic(-11);
    const result12a = this.lineDistanceLogic(-12);
    const result13a = this.lineDistanceLogic(-13);
    const result14a = this.lineDistanceLogic(-14);
    const result15a = this.lineDistanceLogic(-15);
    const result16a = this.lineDistanceLogic(-16);
    const result17a = this.lineDistanceLogic(-17);
    const result18a = this.lineDistanceLogic(-18);


    // //ALTERNATE
    // const result0 = this.alterDistanceLogic(0);
    // const result1 = this.alterDistanceLogic(1);
    // const result2 = this.alterDistanceLogic(2);
    // const result3 = this.alterDistanceLogic(3);
    // const result4 = this.alterDistanceLogic(4);
    // const result5 = this.alterDistanceLogic(5);
    // const result6 = this.alterDistanceLogic(6);
    // const result7 = this.alterDistanceLogic(7);
    // const result8 = this.alterDistanceLogic(8);
    // const result9 = this.alterDistanceLogic(9);
    // const result10 = this.alterDistanceLogic(10);

    // const result1a = this.alterDistanceLogic(-1);
    // const result2a = this.alterDistanceLogic(-2);
    // const result3a = this.alterDistanceLogic(-3);
    // const result4a = this.alterDistanceLogic(-4);
    // const result5a = this.alterDistanceLogic(-5);
    // const result6a = this.alterDistanceLogic(-6);
    // const result7a = this.alterDistanceLogic(-7);
    // const result8a = this.alterDistanceLogic(-8);
    // const result9a = this.alterDistanceLogic(-9);
    // const result10a = this.alterDistanceLogic(-10);



    console.log("----------Same Distance-----------");
    console.log(result0);
    this.printFailureList(result0);
    console.log("----------+1 Distance-----------");
    console.log(result1);
    this.printFailureList(result1);
    console.log("----------+2 Distance-----------");
    console.log(result2);
    this.printFailureList(result2);
    console.log("----------+3 Distance-----------");
    console.log(result3);
    this.printFailureList(result3);
    console.log("----------+4 Distance-----------");
    console.log(result4);
    this.printFailureList(result4);
    console.log("----------+5 Distance-----------");
    console.log(result5);
    this.printFailureList(result5);
    console.log("----------+6 Distance-----------");
    console.log(result6);
    this.printFailureList(result6);
    console.log("----------+7 Distance-----------");
    console.log(result7);
    this.printFailureList(result7);
    console.log("----------+8 Distance-----------");
    console.log(result8);
    this.printFailureList(result8);
    console.log("----------+9 Distance-----------");
    console.log(result9);
    this.printFailureList(result9);
    console.log("----------+10 Distance-----------");
    console.log(result10);
    this.printFailureList(result10);
    console.log("----------+11 Distance-----------");
    console.log(result11);
    this.printFailureList(result11);
    console.log("----------+12 Distance-----------");
    console.log(result12);
    this.printFailureList(result12);
    console.log("----------+13 Distance-----------");
    console.log(result13);
    this.printFailureList(result13);
    console.log("----------+14 Distance-----------");
    console.log(result14);
    this.printFailureList(result14);
    console.log("----------+15 Distance-----------");
    console.log(result15);
    this.printFailureList(result15);
    console.log("----------+16 Distance-----------");
    console.log(result16);
    this.printFailureList(result16);
    console.log("----------+17 Distance-----------");
    console.log(result17);
    this.printFailureList(result17);
    console.log("----------+18 Distance-----------");
    console.log(result18);
    this.printFailureList(result18);



    console.log("----------MINUS DISTANCE-----------");
    console.log("----------1 Distance-----------");
    console.log(result1a);
    this.printFailureList(result1a);
    console.log("----------2 Distance-----------");
    console.log(result2a);
    this.printFailureList(result2a);
    console.log("----------3 Distance-----------");
    console.log(result3a);
    this.printFailureList(result3a);
    console.log("---------4 Distance-----------");
    console.log(result4a);
    this.printFailureList(result4a);
    console.log("----------5 Distance-----------");
    console.log(result5a);
    this.printFailureList(result5a);
    console.log("----------6 Distance-----------");
    console.log(result6a);
    this.printFailureList(result6a);
    console.log("----------7 Distance-----------");
    console.log(result7a);
    this.printFailureList(result7a);
    console.log("----------8 Distance-----------");
    console.log(result8a);
    this.printFailureList(result8a);
    console.log("----------9 Distance-----------");
    console.log(result9a);
    this.printFailureList(result9a);
    console.log("----------10 Distance-----------");
    console.log(result10a);
    this.printFailureList(result10a);
    console.log("----------11 Distance-----------");
    console.log(result11a);
    this.printFailureList(result11a);
    console.log("----------12 Distance-----------");
    console.log(result12a);
    this.printFailureList(result12a);
    console.log("----------13 Distance-----------");
    console.log(result13a);
    this.printFailureList(result13a);
    console.log("---------14 Distance-----------");
    console.log(result14a);
    this.printFailureList(result14a);
    console.log("----------15 Distance-----------");
    console.log(result15a);
    this.printFailureList(result15a);
    console.log("----------16 Distance-----------");
    console.log(result16a);
    this.printFailureList(result16a);
    console.log("----------17 Distance-----------");
    console.log(result17a);
    this.printFailureList(result17a);
    console.log("----------18 Distance-----------");
    console.log(result18a);
    this.printFailureList(result18a);

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


  nextBetLogic(incrementDistance: any) {
    const sequence = this.extractedNumbers;

    const prev = sequence[1];
    const curr = sequence[0];

    const { direction, distance } = this.getDistance(prev, curr);
    const adjustedDistance = distance + incrementDistance;
    const expected = this.getNextBetNumber(curr, direction, adjustedDistance);

    return expected;
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
        totalLoss += count;
        // console.log(`Failure #${index + 1}: Success at ${count}, Profit: ${profit}, Loss: ${count}`);
      }
    });

    const net = totalProfit - totalLoss;

    console.log(`\nTotal Profit: ${totalProfit}`);
    console.log(`Total Loss: ${totalLoss}`);
    console.log(`Net Profit/Loss: ${net}`);

    const maxRounds = 18;
    const successWithin36 = failureCountsOnly.filter(gap => gap <= maxRounds);
    const failOver36 = failureCountsOnly.filter(gap => gap > maxRounds);

    console.log("✅ Success within 18:", successWithin36.length); // 14
    console.log("❌ Fail over 18:", failOver36.length); // 5
    console.log("📊 Success Rate:", ((successWithin36.length / failureCountsOnly.length) * 100).toFixed(2) + "%");
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
}
