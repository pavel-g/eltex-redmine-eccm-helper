import {Controller} from "@tsed/di";
import {Get, Post, Returns} from "@tsed/schema";
import {WeeklyReportService} from "../services/WeeklyReportService";
import {ReportMin} from "../models/weeklyreport/Report";
import {QueryParams, RawBodyParams} from "@tsed/common";
import {WeeklyReportFormattedService} from "../services/WeeklyReportFormattedService";

@Controller('/weekly-report')
export class WeeklyReportController {

  constructor(
    private weeklyReportService: WeeklyReportService,
    private weeklyReportFormattedService: WeeklyReportFormattedService
  ) {
  }

  @Get()
  @Returns()
  async getWeeklyReport(
    @QueryParams('from') from: Date,
    @QueryParams('to') to: Date
  ): Promise<ReportMin|null> {
    return await this.weeklyReportService.getReport(from, to);
  }

  @Get('/formatted')
  @Returns(200)
  async getWeeklyReportMarkdown(
    @QueryParams('from') from: Date,
    @QueryParams('to') to: Date
  ): Promise<string|null> {
    const res = await this.weeklyReportFormattedService.getReport(from, to);
    return res;
  }

  @Post('/formatted')
  @Returns(200)
  async getWeeklyReportMarkdownByTemplate(
    @QueryParams('from') from: Date,
    @QueryParams('to') to: Date,
    @RawBodyParams() template: string
  ): Promise<string|null> {
    const res = await this.weeklyReportFormattedService.getReport(from, to, template);
    return res;
  }

}