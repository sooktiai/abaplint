import {expect} from "chai";
import * as Combi from "../../../src/abap/2_statements/combi";
import {getTokens} from "../_utils";
import {Config} from "../../../src/config";
import {SQLCompare} from "../../../src/abap/2_statements/expressions";
import {ExpressionNode} from "../../../src/abap/nodes";

describe("Test expression, SQLCompare", () => {
  it("test1", () => {
    const abap = `kunnr IN ( SELECT field FROM ztab )`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLCompare().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });

  // A "-" with no blank around it is the component selector: the operand on the right keeps it,
  // where the arithmetic of the right-hand side (#3983) read it as a minus.
  const shapeOf = (abap: string) => {
    const nodes = Combi.Combi.run(new SQLCompare().getRunnable(), getTokens(abap), Config.getDefault().getVersion());
    return nodes?.map(n => n.get().constructor.name + "(" + (n instanceof ExpressionNode ? n.concatTokens() : n.getFirstToken().getStr()) + ")");
  };

  it("keeps a component of a host variable in the right-hand operand", () => {
    expect(shapeOf("addrnumber = @lt_vendors-adrnr")).to.deep.equal([
      "SQLFieldName(addrnumber)", "SQLCompareOperator(=)", "SQLSource(@lt_vendors-adrnr)"]);
  });

  it("keeps a component of an operand without @ in the right-hand operand", () => {
    expect(shapeOf("id = wa_customer-id")).to.deep.equal([
      "SQLFieldName(id)", "SQLCompareOperator(=)", "SQLSource(wa_customer-id)"]);
  });

  it("keeps a component of a component in the right-hand operand", () => {
    expect(shapeOf("matnr = @ls_item-material-matnr")).to.deep.equal([
      "SQLFieldName(matnr)", "SQLCompareOperator(=)", "SQLSource(@ls_item-material-matnr)"]);
  });

  it("still reads a minus with blanks around it as arithmetic", () => {
    expect(shapeOf("menge > @lv_qty - erfmg")).to.deep.equal([
      "SQLFieldName(menge)", "SQLCompareOperator(>)", "SQLSource(@lv_qty)", "WDashW(-)", "SQLFieldName(erfmg)"]);
  });

  it("test2", () => {
    const abap = `dsf IN ( SELECT sdf FROM sdf AS sdfp JOIN sdf AS sdft ON sdf = sdfdfs )`;
    const tokens = getTokens(abap);
    const match = Combi.Combi.run(new SQLCompare().getRunnable(), tokens, Config.getDefault().getVersion());
//    console.dir(match);
    expect(match).to.not.equal(undefined);
  });
});