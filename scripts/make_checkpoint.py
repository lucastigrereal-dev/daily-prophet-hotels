"""Local, cumulative recovery artifact. No network, environment values or untracked files."""
import argparse,datetime,hashlib,json,pathlib,subprocess,tempfile,zipfile
p=argparse.ArgumentParser();p.add_argument('--id',required=True);p.add_argument('--output',required=True);a=p.parse_args()
def git(*args):return subprocess.check_output(['git',*args])
if git('status','--porcelain').strip():raise SystemExit('Commit/stage explicitly before checkpoint; working tree must be clean.')
subprocess.run(['node','scripts/scan-secrets.mjs'],check=True,stdout=subprocess.DEVNULL)
base='38ca624616bbc63756ce4e4c58dadd14d49886a7';head=git('rev-parse','HEAD').decode().strip();tree=git('rev-parse','HEAD^{tree}').decode().strip()
entries={'source.tar':git('archive','--format=tar',head),'baseline.tar':git('archive','--format=tar',base),'changes.patch':git('diff','--binary',base,head),'commits.mbox':git('format-patch','--stdout',f'{base}..{head}')}
manifest={'class':'NOVA_CANDIDATA_RECOMPOSTA_NOT_R2_RECOVERY','checkpoint':a.id,'base':base,'head':head,'tree':tree,'branch':git('branch','--show-current').decode().strip(),'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_files':[],'entries':[]}
for item in git('ls-tree','-r','--name-only',head).decode().splitlines():
 data=git('show',f'{head}:{item}');manifest['source_files'].append({'path':item,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
for name,data in entries.items():manifest['entries'].append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
entries['manifest.json']=(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode()
out=pathlib.Path(a.output);out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for name,data in entries.items():z.writestr(name,data)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for name,data in entries.items():assert z.read(name)==data
raw=out.read_bytes();receipt={'path':str(out),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'head':head,'tree':tree,'manifest_sha256':hashlib.sha256(entries['manifest.json']).hexdigest()}
(out.with_suffix('.receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
