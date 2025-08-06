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
  betNumber: any;

  wheel = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
    27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26
  ];

  ngOnInit(): void {
  }

  extractNumbers(): void {
    this.extractedNumbers = [];

    // Create a dummy DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.htmlInput, 'text/html');

    const elements = doc.querySelectorAll('.roulette-history-item__value-text--XeOtB');

    elements.forEach((el) => {
      const text = el.textContent?.trim();
      if (text && !isNaN(Number(text))) {
        this.extractedNumbers.push(Number(text));
      }
    });

    this.extractedText = this.extractedNumbers.join(',');
    console.log(this.extractedNumbers);
    this.getRouletteDistancesLine();
  }

  onExtractedTextChange() {
    const parts = this.extractedText.split(',').map(p => p.trim());
    this.extractedNumbers = parts.map(Number).filter(num => !isNaN(num));

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
    this.betNumber = this.nextBetLogic(-8);
    // this.betNumber  = this.nextBetLogic(-9);
    // this.betNumber  = this.nextBetLogic(-10);
    console.log("--------NEXT BET: " + this.betNumber)
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
      if (count > 18) {
        // Full failure
        totalLoss += 18;
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
  }


}
