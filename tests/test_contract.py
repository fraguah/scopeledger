"""Mocked GenVM state tests: not a substitute for real network consensus."""
import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path

class UserError(Exception): pass
class Return:
    def __init__(self,calldata): self.calldata=calldata
class Contract:
    def __new__(cls):
        obj=object.__new__(cls)
        obj.agreements,obj.requests,obj.dedup={},{},{}
        return obj
gl=types.SimpleNamespace(Contract=Contract,public=types.SimpleNamespace(write=lambda f:f,view=lambda f:f),vm=types.SimpleNamespace(UserError=UserError,Return=Return),message=types.SimpleNamespace(sender_address=''),message_raw={'datetime':'2026-11-04T18:00:00Z'},nondet=types.SimpleNamespace())
fake=types.ModuleType('genlayer');fake.gl,fake.TreeMap,fake.u32,fake.Address=gl,dict,int,str
sys.modules['genlayer']=fake
spec=importlib.util.spec_from_file_location('scope_ledger',Path(__file__).parents[1]/'contracts/scope_ledger.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
A,B,C=['0x'+str(i)*40 for i in (1,2,3)]

class ContractTests(unittest.TestCase):
    def setUp(self):
        gl.message.sender_address=A;self.c=mod.ScopeLedger()
        self.clauses=['Build five responsive English pages.','Include two visual revision rounds.']
        self.aid=self.c.create_agreement('Launch scope',B,json.dumps(self.clauses),'Payments are excluded.','')
        self.a=json.loads(self.c.get_agreement(self.aid))
    def accept(self):
        gl.message.sender_address=B;self.c.accept_agreement(self.aid,self.a['terms_hash'])
    def request(self):
        self.accept();return self.c.open_request(self.aid,self.a['terms_hash'],'Add a payment checkout page.')
    def result(self,label='CHANGE_ORDER'):
        return {'label':label,'basis_ids':[0],'scope_quote':'Payments are excluded.','request_quote':'payment checkout'}
    def run_review(self,result):
        gl.nondet.exec_prompt=lambda *a,**k:result
        def run(leader,validator):
            value=leader()
            if not validator(Return(value)):raise UserError('Consensus rejected')
            return value
        gl.vm.run_nondet_unsafe=run
    def test_acceptance_needs_named_counterparty_and_hash(self):
        with self.assertRaises(UserError):self.c.accept_agreement(self.aid,self.a['terms_hash'])
        gl.message.sender_address=B
        with self.assertRaises(UserError):self.c.accept_agreement(self.aid,'wrong')
        self.c.accept_agreement(self.aid,self.a['terms_hash'])
        self.assertEqual(json.loads(self.c.get_agreement(self.aid))['status'],'ACTIVE')
    def test_request_requires_accepted_baseline(self):
        with self.assertRaises(UserError):self.c.open_request(self.aid,self.a['terms_hash'],'Add a payment checkout page.')
    def test_outsider_and_duplicate_request_rejected(self):
        rid=self.request()
        with self.assertRaises(UserError):self.c.open_request(self.aid,self.a['terms_hash'],'Add a payment checkout page.')
        gl.message.sender_address=C
        with self.assertRaises(UserError):self.c.open_request(self.aid,self.a['terms_hash'],'Another concrete request.')
        with self.assertRaises(UserError):self.c.review_request(rid)
    def test_reviews_preserve_terms(self):
        rid=self.request();self.run_review(self.result());self.c.review_request(rid)
        fresh=json.loads(self.c.get_agreement(self.aid))
        for key in ('clauses','exclusions','creator','counterparty','terms_hash'):self.assertEqual(self.a[key],fresh[key])
        with self.assertRaises(UserError):self.c.cancel_proposal(self.aid)
    def test_second_review_other_party_only_and_disagreement_preserved(self):
        rid=self.request();self.run_review(self.result());self.c.review_request(rid)
        with self.assertRaises(UserError):self.c.second_review(rid)
        gl.message.sender_address=A;self.run_review(self.result('NEEDS_CLARIFICATION'));self.c.second_review(rid)
        r=json.loads(self.c.get_request(rid));self.assertEqual(r['status'],'DISAGREEMENT');self.assertEqual(r['decision'],'NEEDS_CLARIFICATION');self.assertEqual(len(r['reviews']),2)
        with self.assertRaises(UserError):self.c.second_review(rid)
    def test_amendment_bilateral_and_old_request_still_pinned(self):
        rid=self.request();old=json.loads(self.c.get_request(rid))
        new=self.c.create_agreement('Extended scope',A,json.dumps(self.clauses+['Add a payment checkout page.']),'','1')
        self.assertEqual(json.loads(self.c.get_agreement('1'))['status'],'ACTIVE')
        gl.message.sender_address=A;self.c.accept_agreement(new,json.loads(self.c.get_agreement(new))['terms_hash'])
        self.assertEqual(json.loads(self.c.get_agreement('1'))['status'],'SUPERSEDED')
        self.assertEqual(json.loads(self.c.get_request(rid))['terms_hash'],old['terms_hash'])
        with self.assertRaises(UserError):self.c.open_request('1',self.a['terms_hash'],'A newer request here.')
    def test_competing_amendment_cannot_replace_superseded_parent(self):
        self.accept();first=self.c.create_agreement('First amendment',A,json.dumps(self.clauses),'','1');second=self.c.create_agreement('Second amendment',A,json.dumps(self.clauses),'','1')
        gl.message.sender_address=A;self.c.accept_agreement(first,json.loads(self.c.get_agreement(first))['terms_hash'])
        with self.assertRaises(UserError):self.c.accept_agreement(second,json.loads(self.c.get_agreement(second))['terms_hash'])
    def test_quotes_and_sorted_integer_ids(self):
        r=self.result();r['scope_quote']='Fabricated quote'
        with self.assertRaises(UserError):mod.validate_decision(r,self.clauses,'Payments are excluded.','Add a payment checkout page.')
        for ids in ([True],[9],[1,0],[0,0]):
            r=self.result();r['basis_ids']=ids
            with self.assertRaises(UserError):mod.validate_decision(r,self.clauses,'Payments are excluded.','Add a payment checkout page.')
    def test_in_scope_requires_explicit_basis(self):
        r=self.result('IN_SCOPE');r['basis_ids']=[];r['scope_quote']=''
        with self.assertRaises(UserError):mod.validate_decision(r,self.clauses,'Payments are excluded.','Add a payment checkout page.')
    def test_validator_compares_semantics_not_json_shape(self):
        rid=self.request();self.run_review(self.result());answers=iter([self.result(),self.result('NEEDS_CLARIFICATION')]);gl.nondet.exec_prompt=lambda *a,**k:next(answers)
        with self.assertRaises(UserError):self.c.review_request(rid)
        self.assertEqual(json.loads(self.c.get_request(rid))['reviews'],[])
